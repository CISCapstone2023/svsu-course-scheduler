import { z } from "zod";
import {
  type Course,
  Prisma,
  type ScheduleRevision,
  CourseState,
} from "@prisma/client";
import { flatten } from "lodash";

//Get instance of prisma
import { prisma } from "src/server/db";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { createCourseSchema } from "src/server/api/routers/projects";
import {
  calendarCourseSchema,
  Semesters,
  type ICalendarCourseSchema,
} from "src/validation/calendar";

// Validation -----------------------------------------------------------------------------------------------------

// Essentially creates a new data tyoe built to store comprehensive queries for the calendar
const revisionWithCourses = Prisma.validator<Prisma.ScheduleRevisionArgs>()({
  include: {
    courses: {
      include: {
        faculty: {
          include: { faculty: true },
        },
        locations: {
          include: { rooms: { include: { building: true } } },
        },
      },
    },
  },
});

/**
 * courseWithRelationships
 * Get a course schema types which includes the relationships
 * that it has on the tables.
 */
const courseWithRelationships = Prisma.validator<Prisma.CourseArgs>()({
  include: {
    faculty: {
      include: {
        faculty: true,
      },
    },
    notes: true,
    locations: {
      include: {
        rooms: {
          include: {
            building: {
              include: {
                campus: true,
              },
            },
          },
        },
      },
    },
  },
});

//Export type from Prisma
export type CourseWithLocationsFacultyAndNotes = Prisma.CourseGetPayload<
  typeof courseWithRelationships
>;

//Export type from Prisma
export type RevisionWithCourses = Prisma.ScheduleRevisionGetPayload<
  typeof revisionWithCourses
>;

/**
 * ICourseSchemaWithMetadata
 *
 * Type that joins the course schema with partial data for the select boxes.
 * This is to provide the information about the current faculty and buildings,
 * although we store all the information by the TUID value of faculty and building to courses
 */
type ICourseSchemaWithMetadata = ICalendarCourseSchema & {
  faculty: {
    value: string;
    label: string;
  };
  locations: Array<{
    rooms: {
      building: {
        label: string;
        value: string;
      };
    };
  }>;
};

/**
 * courseType
 * Gets a course type from prisma
 */
const courseType = Prisma.validator<Prisma.CourseArgs>()({
  include: {
    faculty: {
      include: { faculty: true },
    },
    locations: {
      include: {
        rooms: { include: { building: { include: { campus: true } } } },
      },
    },
    notes: true,
  },
});

//Export the TS type from inference
export type IScheduleCourse = Prisma.CourseGetPayload<typeof courseType>;

// Routers --------------------------------------------------------------------------------------------------------

export const calendarRouter = createTRPCRouter({
  // This will grab one revision by tuid and return all courses attached to it, organized by days of the week
  getRevision: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
        faculty: z.string().array().optional(), // tuids
        buildings: z.string().array().optional(), // tuids
        departments: z.string().array().optional(), // name
        credits: z.number().optional(),
        minRoomNum: z.string(), // Look into the regex that Chris made for this
        maxRoomNum: z.string(),

        semester_fall: z.boolean().default(false),
        semester_winter: z.boolean().default(false),
        semester_spring: z.boolean().default(false),
        semester_summer: z.boolean().default(false),

        //Defines the booleans for the day of the week the guideline applies to (Thanks Sam)
        days: z
          .object({
            monday: z.boolean().default(false),
            tuesday: z.boolean().default(false),
            wednesday: z.boolean().default(false),
            thursday: z.boolean().default(false),
            friday: z.boolean().default(false),
            saturday: z.boolean().default(false),
            sunday: z.boolean().default(false),
          })
          .default({
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
          }),
      })
    )
    .query(async ({ ctx, input }) => {
      // Running queries to find all courses on a specific revision that occur on a specific day. There is one of these queries
      // for each day of the week (A course that is taught on both Monday and Wednesday will appear in both queries, and so on)

      // Throw all of these into a transaction
      const monday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(input, "day_monday");
      const tuesday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(input, "day_tuesday");
      const wednesday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(input, "day_wednesday");
      const thursday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(input, "day_thursday");
      const friday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(input, "day_friday");
      const saturday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(input, "day_saturday");
      const sunday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(input, "day_sunday");

      const online_courses: RevisionWithCourses | null =
        await queryCoursesByDay(input);

      // Use the semester input booleans to return what specific semester we are looking for
      const semester = getSemester(input);

      const coursesWithinAGuideline = async (
        revision: RevisionWithCourses | null
      ) => {
        if (revision == null) {
          console.log(revision);
        }
        const out = await Promise.all(
          revision!.courses.map(async (course) => {
            //Check to make sure at least one location has a monday
            const hasMonday = course.locations.some((location) => {
              return location.day_monday === true;
            });

            //Check to make sure at least one location has a tuesday
            const hasTuesday = course.locations.some((location) => {
              return location.day_tuesday == true;
            });
            //Check to make sure at least one location has a wednesday
            const hasWednesday = course.locations.some((location) => {
              return location.day_wednesday == true;
            });
            //Check to make sure at least one location has a thursday
            const hasThursday = course.locations.some((location) => {
              return location.day_thursday == true;
            });
            //Check to make sure at least one location has a friday
            const hasFriday = course.locations.some((location) => {
              return location.day_friday == true;
            });
            //Check to make sure at least one location has a saturday
            const hasSaturday = course.locations.some((location) => {
              return location.day_saturday == true;
            });
            //Check to make sure at least one location has a sunday
            const hasSunday = course.locations.some((location) => {
              return location.day_sunday == true;
            });

            //check the semester variable for each semester to get a true
            //or false value to be used in the guideline query below
            const hasFall = semester === "FA";
            const hasWinter = semester === "WI";
            const hasSpring = semester === "SP";
            const hasSummer = semester === "SU";

            //Get the total amount of meetings that a course has by adding to a
            //total sum if it occurs on a day of the week
            const totalMeetings = course.locations
              .map((location) => {
                let total = 0;
                if (location.day_monday === true) total++;
                if (location.day_tuesday === true) total++;
                if (location.day_wednesday === true) total++;
                if (location.day_thursday === true) total++;
                if (location.day_friday === true) total++;
                if (location.day_saturday === true) total++;
                if (location.day_sunday === true) total++;
                return total;
              })
              .reduce((sum, value) => {
                return sum + value;
              }, 0);
            console.log({ totalMeetings });
            //Query each course to the guidelines course model
            const result = await ctx.prisma.guidelinesCourses.count({
              where: {
                AND: [
                  {
                    //Ensure that whichever semester is true for the
                    //course is also true for a guideline, only one will be true
                    OR: [
                      hasFall ? { semester_fall: true } : {},
                      hasWinter ? { semester_winter: true } : {},
                      hasSpring ? { semester_spring: true } : {},
                      hasSummer ? { semester_summer: true } : {},
                    ],
                  },
                  {
                    credits: course.credits,
                    meeting_amount: totalMeetings,
                  },
                  {
                    days: {
                      every: {
                        AND: [
                          //for every day in the course guideline,
                          //compare the guideline for each day to true,
                          //if the has'day' from above returns true
                          hasMonday ? { day_monday: true } : {},
                          hasTuesday ? { day_tuesday: true } : {},
                          hasWednesday ? { day_wednesday: true } : {},
                          hasThursday ? { day_thursday: true } : {},
                          hasFriday ? { day_friday: true } : {},
                          hasSaturday ? { day_saturday: true } : {},
                          hasSunday ? { day_sunday: true } : {},
                        ],
                      },
                    },
                  },
                  {
                    times: {
                      every: {
                        //Grabs the times from each location associated with the course
                        //Uncomment once merged and database CourseLocation has times as Ints
                        AND: [
                          ...course.locations.map((location) => {
                            return {
                              start_time: location.start_time,
                              end_time: location.end_time,
                            };
                          }),
                        ],
                        // start_time: course.start_time,
                        // end_time: course.end_time,
                      },
                    },
                  },
                ],
              },
            });

            //Get all course data but also add a new boolean value to
            //make sure its within the course guideline
            const output = {
              withinGuideline: result > 0,
              ...course,
            } as IScheduleCourse & { withinGuideline: boolean }; //use Partial to get around the Promise

            return output;
          })
        );

        return out;
      };

      // const within = {
      //   monday_courses: await coursesWithinAGuideline(monday_courses),
      //   tuesday_courses: await coursesWithinAGuideline(tuesday_courses),
      //   wednesday_courses: await coursesWithinAGuideline(wednesday_courses),
      //   thursday_courses: await coursesWithinAGuideline(thursday_courses),
      //   friday_courses: await coursesWithinAGuideline(friday_courses),
      //   saturday_courses: await coursesWithinAGuideline(saturday_courses),
      //   sunday_courses: await coursesWithinAGuideline(sunday_courses),
      // };

      // Send the client back the ame of the revision, the semester, and the results of each of the course-by-day queries
      const out = {
        revision_name: monday_courses?.name,
        semesters: semester,
        monday_courses: await coursesWithinAGuideline(monday_courses),
        tuesday_courses: await coursesWithinAGuideline(tuesday_courses),
        wednesday_courses: await coursesWithinAGuideline(wednesday_courses),
        thursday_courses: await coursesWithinAGuideline(thursday_courses),
        friday_courses: await coursesWithinAGuideline(friday_courses),
        saturday_courses: await coursesWithinAGuideline(saturday_courses),
        sunday_courses: await coursesWithinAGuideline(sunday_courses),
        online: online_courses?.courses as (IScheduleCourse & {
          withinGuideline: boolean;
        })[],
      };

      console.log(out);
      return out;
    }),

  /**
   * Procedure that will update a course's state to either REMOVED or original_state
   * depending on the current state of the course
   */
  removeCourse: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findUnique({
        where: {
          tuid: input.tuid,
        },
      });
      if (course !== null) {
        await ctx.prisma.course.update({
          where: {
            tuid: input.tuid,
          },
          data: {
            state:
              course.state == CourseState.REMOVED
                ? course.original_state
                : CourseState.REMOVED,
          },
        });
      }
    }),

  // This just grabs one course by its tuid
  getCourse: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const course: CourseWithLocationsFacultyAndNotes | null =
        //Query a course where the tuid is at the current tuid
        await ctx.prisma.course.findUnique({
          //Include the faculty many-to-many relationship
          include: {
            //This is the table in the middle
            faculty: {
              include: {
                //This is the actual faculty table
                faculty: true,
              },
            },
            //Include nodes
            notes: true,
            //Include locations, with rooms, buildings, and campus
            locations: {
              include: {
                rooms: {
                  include: {
                    building: {
                      include: {
                        campus: true,
                      },
                    },
                  },
                },
              },
            },
          },
          where: {
            tuid: input.tuid,
          },
        });
      //Do we have a course?
      if (course != null) {
        /**
         * Function that will determine which semester the course is in and then
         * returns the proper enum
         * @author Chris Bellefeuille
         */
        function getSemester(
          fall: boolean,
          winter: boolean,
          spring: boolean,
          summer: boolean
        ) {
          if (fall) return Semesters.FALL;
          if (winter) return Semesters.WINTER;
          if (spring) return Semesters.SPRING;
          if (summer) return Semesters.SUMMER;
        }

        //If so set the data
        return {
          tuid: course.tuid,
          capacity: course.capacity,
          section_id: course.section_id,
          course_number: course.course_number,
          credits: course.credits,
          department: course.department,
          div: course.div,
          end_date: course.end_date,
          start_date: course.start_date,
          faculty: {
            //Spread the map of courses but only the first one (which is still an array)
            ...(course.faculty.map((faculty) => {
              return {
                faculty_tuid: faculty.faculty_tuid,

                //Add the attribute for the react select as they use the provided value by default
                label: faculty.faculty.name,
                value: faculty.faculty_tuid,
              };
            })[0] ?? {}),
          },

          //Set the proper notes using a filter
          notes: {
            ACAMDEMIC_AFFAIRS:
              course.notes.filter((note) => note.type == "ACAMDEMIC_AFFAIRS")[0]
                ?.note ?? "",
            CHANGES:
              course.notes.filter((note) => note.type == "CHANGES")[0]?.note ??
              "",
            DEPARTMENT:
              course.notes.filter((note) => note.type == "DEPARTMENT")[0]
                ?.note ?? "",
          },
          //Add the locations, with all information about the location and rooms
          locations: [
            ...course.locations.map((location) => {
              return {
                day_friday: location.day_friday,
                day_monday: location.day_monday,
                day_saturday: location.day_saturday,
                day_sunday: location.day_sunday,
                day_thursday: location.day_thursday,
                day_tuesday: location.day_tuesday,
                day_wednesday: location.day_wednesday,
                end_time: location.end_time,
                is_online: location.is_online,
                start_time: location.start_time,
                rooms: {
                  ...location.rooms.map((room) => {
                    return {
                      // building: {
                      //   label: `${room.room} - ${room.room} (${room.room})`,
                      //   building_tuid: room.room,
                      //   value: room.room,
                      // },
                      building: {
                        buiding_tuid: room.building_tuid,
                        label: `${room.building.campus.name} - ${room.building.name} (${room.building.prefix})`,
                        value: room.building_tuid,
                      },
                      room: room.room,
                    };
                  })[0],
                },
              };
            }),
          ],
          instruction_method: course.instruction_method,
          original_state: course.original_state,
          section: course.section,
          semester: getSemester(
            course.semester_fall,
            course.semester_winter,
            course.semester_spring,
            course.semester_summer
          ),
          state: course.state,
          status: course.status,
          type: course.type,
          subject: course.subject,
          term: course.term,
          title: course.title,
        } as ICourseSchemaWithMetadata;
      }
    }),

  //This will grab one revision by tuid and return all courses attached to it
  getAllCourses: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const revisionWithCourses = await ctx.prisma.scheduleRevision.findUnique({
        where: {
          tuid: input.tuid,
        },
        include: {
          courses: {
            include: {
              locations: true,
            },
          },
        },
      });

      const allCourses = revisionWithCourses?.courses;

      allCourses?.forEach((course) => {
        console.log(course.course_number);
      });

      return allCourses;
    }),

  /**
   * getSemesters
   * Get the semester based on the revision
   * @author Brendan Fuller
   */
  getSemestersByRevision: protectedProcedure
    .input(
      z.object({
        revision: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      //Get each semester count
      const [sp, fa, wi, su, name] = await ctx.prisma.$transaction([
        //Spring
        ctx.prisma.course.count({
          where: {
            revision: {
              tuid: input.revision,
            },
            semester_spring: true,
          },
        }),
        //Fall
        ctx.prisma.course.count({
          where: {
            revision: {
              tuid: input.revision,
            },
            semester_fall: true,
          },
        }),
        //Winter
        ctx.prisma.course.count({
          where: {
            revision: {
              tuid: input.revision,
            },
            semester_winter: true,
          },
        }),
        //Summer
        ctx.prisma.course.count({
          where: {
            revision: {
              tuid: input.revision,
            },
            semester_summer: true,
          },
        }),
        ctx.prisma.scheduleRevision.findFirst({
          where: {
            tuid: input.revision,
          },
          select: {
            name: true,
          },
        }),
      ]);
      //Temp list of possible semesters for this current revision
      const semesters: ITab[] = [];

      if (name != undefined) {
        if (fa > 0) {
          //Add fall to this list for the current revision
          semesters.push({
            title: "Fall",
            name: name.name,
            semester: "FA",
            revision: input.revision,
          });
        }
        if (wi > 0) {
          //Add winter to this list for the current revision
          semesters.push({
            title: "Winter",
            name: name.name,
            semester: "WI",
            revision: input.revision,
          });
        }
        if (sp > 0) {
          //Add spring to this list for the current revision
          semesters.push({
            title: "Spring",
            name: name.name,
            semester: "SP",
            revision: input.revision,
          });
        }
        if (su > 0) {
          //Add summer to the list for the current revision
          semesters.push({
            title: "Summer",
            name: name.name,
            semester: "SU",
            revision: input.revision,
          });
        }
      }
      return semesters;
    }),
  /**
   * Get Semesters
   *
   * Get a list of revision and every semeseter possible for said, for
   * fall, winter, spring, and summer
   * @author Brendan Fuller
   */
  getSemesters: protectedProcedure.query(async ({ ctx, input }) => {
    //Get the list of revision by the current user
    const schedules = await ctx.prisma.scheduleRevision.findMany({
      where: {
        creator_tuid: ctx.session.user.id,
      },
      //Make sure to include the courses
      include: {
        courses: true,
      },
    });

    /**
     * Geneates the information regarding a revision
     * for use with the select input on the frontend
     * @param valid
     * @param revision
     * @param semester
     * @returns
     */
    const generateSelectRevisionInformation = (
      valid: boolean,
      revision: ScheduleRevision & {
        courses: Course[];
      },
      semester: string
    ) => {
      //Are we valid? If so created the object, if not make it empty
      return valid
        ? ({
            label: revision.name + " " + semester,
            value: {
              semester,
              revision: revision.tuid,
              title: revision.name + " " + semester,
            },
          } as IRevisionSelect)
        : {};
    };

    //Loop all of the revisions
    const data = schedules.map((revision) => {
      //State if we have a semesters
      const semesters = {
        fall: false,
        winter: false,
        spring: false,
        summer: false,
      };

      //Loop all courses and set that state to true depending on if a
      //semester does occur
      for (const index in revision.courses) {
        const course = revision.courses[index];
        if (course?.semester_fall) semesters.fall = true;
        if (course?.semester_winter) semesters.winter = true;
        if (course?.semester_spring) semesters.spring = true;
        if (course?.semester_summer) semesters.summer = true;
      }

      //Create the list of possible ones
      const listOfPossbileSemesters = [
        generateSelectRevisionInformation(semesters.fall, revision, "FA"),
        generateSelectRevisionInformation(semesters.winter, revision, "WI"),
        generateSelectRevisionInformation(semesters.spring, revision, "SP"),
        generateSelectRevisionInformation(semesters.summer, revision, "SU"),
      ];

      //Remove the empty semesters and force the type to be an array of Revisions
      const revisionWithSemesters = listOfPossbileSemesters.filter((ele) => {
        return ele.constructor === Object && Object.keys(ele).length > 0;
      }) as IRevisionSelect[];

      //Return that
      return revisionWithSemesters;
    });

    //Now we flatten that so we don't have a 2D array but now a 1D array
    return flatten(data);
  }),

  /**
   * addCourseToRevision
   * Adds a newly created course to a revision
   */
  addCourseToRevision: protectedProcedure
    .input(
      z.object({
        //Input comes in as a revision tuid and a courseSchema variable
        tuid: z.string(),
        course: calendarCourseSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      //

      const locations = input.course.locations.map((location) => {
        return {
          day_friday: location.day_friday,
          day_monday: location.day_monday,
          day_saturday: location.day_saturday,
          day_sunday: location.day_sunday,
          day_thursday: location.day_thursday,
          day_tuesday: location.day_tuesday,
          day_wednesday: location.day_wednesday,
          end_time: location.end_time,
          is_online: location.is_online,
          start_time: location.start_time,
          ...(location.rooms.room && location.rooms?.building?.buiding_tuid
            ? {
                rooms: {
                  create: [
                    {
                      room: location.rooms.room.toString(),
                      building: {
                        connect: {
                          tuid: location.rooms?.building?.buiding_tuid,
                        },
                      },
                    },
                  ],
                },
              }
            : {}),
        };
      });
      const course = input.course;
      //If parse was successful then...
      await ctx.prisma.course.create({
        data: {
          revision: {
            connect: {
              tuid: input.tuid,
            },
          },
          capacity: course.capacity,
          course_number: course.course_number,
          credits: course.credits,
          instruction_method: course.instruction_method,
          department: course.department,
          div: course.department,
          end_date: course.end_date,
          start_date: course.start_date,
          end_time: 0,
          start_time: 0,
          original_state: "ADDED",
          section: course.section.toString(),
          section_id: null,
          state: "ADDED",
          subject: course.subject,
          term: course.term,
          title: course.title,
          type: course.type,
          status: course.status,
          semester_fall: course.semester == Semesters.FALL,
          semester_winter: course.semester == Semesters.WINTER,
          semester_spring: course.semester == Semesters.SPRING,
          semester_summer: course.semester == Semesters.SUMMER,

          //Add the locations to the course from the mapping above the trasnsacton
          locations: {
            create: [...locations],
          },

          //Add all of the faculty to the course by creating and connecting the many to many
          faculty: {
            create: {
              faculty: {
                connect: {
                  tuid: course.faculty.faculty_tuid,
                },
              },
            },
          },

          //Add the notes, but because are validation supports 3 notes, we manually
          //need to specify them because of issues with dynamic notes on the front end.
          notes: {
            create: [
              {
                note: course.notes.ACAMDEMIC_AFFAIRS,
                type: "ACAMDEMIC_AFFAIRS",
              },
              {
                note: course.notes.CHANGES,
                type: "CHANGES",
              },
              {
                note: course.notes.DEPARTMENT,
                type: "DEPARTMENT",
              },
            ],
          },
        },
      });
      return true;
    }),

  /**
   * updateRevisionCourse
   * Updates a course on a revision
   */
  updateRevisionCourse: protectedProcedure
    .input(calendarCourseSchema)
    .mutation(async ({ ctx, input }) => {
      //Generate the list of locations with the building connections
      const locations = input.locations.map((location) => {
        return {
          day_friday: location.day_friday,
          day_monday: location.day_monday,
          day_saturday: location.day_saturday,
          day_sunday: location.day_sunday,
          day_thursday: location.day_thursday,
          day_tuesday: location.day_tuesday,
          day_wednesday: location.day_wednesday,
          end_time: location.end_time,
          is_online: location.is_online,
          start_time: location.start_time,
          ...(location.rooms.room &&
          location.rooms?.building &&
          location.rooms?.building?.buiding_tuid
            ? {
                rooms: {
                  create: [
                    {
                      room: location.rooms.room.toString(),
                      building: {
                        connect: {
                          tuid: location.rooms?.building?.buiding_tuid,
                        },
                      },
                    },
                  ],
                },
              }
            : {}),
        };
      });

      const course = input;

      await ctx.prisma.$transaction([
        //First delete all of te faculty relationships to the curse
        ctx.prisma.guidelinesFacultyToCourse.deleteMany({
          where: {
            course_tuid: input.tuid,
          },
        }),

        //Delete any notes assocaited with this course
        ctx.prisma.courseNote.deleteMany({
          where: {
            course_tuid: input.tuid,
          },
        }),

        //Delete any locations with the course, and because its cascade
        //any rooms will be deleted as well
        ctx.prisma.courseLocation.deleteMany({
          where: {
            course_tuid: input.tuid,
          },
        }),

        //Now we update the course
        ctx.prisma.course.update({
          where: {
            tuid: input.tuid,
          },
          data: {
            capacity: course.capacity,
            course_number: course.course_number,
            credits: course.credits,
            instruction_method: course.instruction_method,
            department: course.department,
            div: course.department,
            end_date: course.end_date,
            start_date: course.start_date,
            end_time: 0,
            start_time: 0,
            original_state: course.original_state,
            section: course.section.toString(),
            section_id: null,
            state: "MODIFIED",
            subject: course.subject,
            term: course.term,
            title: course.title,
            type: course.type,
            status: course.status,
            semester_fall: course.semester == Semesters.FALL,
            semester_winter: course.semester == Semesters.WINTER,
            semester_spring: course.semester == Semesters.SPRING,
            semester_summer: course.semester == Semesters.SUMMER,

            //Add the locations to the course from the mapping above the trasnsacton
            locations: {
              create: [...locations],
            },

            //Add all of the faculty to the course by creating and connecting the many to many
            faculty: {
              create: {
                faculty: {
                  connect: {
                    tuid: course.faculty.faculty_tuid,
                  },
                },
              },
            },
            //Add the notes, but because are validation supports 3 notes, we manually
            //need to specify them because of issues with dynamic notes on the front end.
            notes: {
              create: [
                {
                  note: course.notes.ACAMDEMIC_AFFAIRS,
                  type: "ACAMDEMIC_AFFAIRS",
                },
                {
                  note: course.notes.CHANGES,
                  type: "CHANGES",
                },
                {
                  note: course.notes.DEPARTMENT,
                  type: "DEPARTMENT",
                },
              ],
            },
          },
        }),
      ]);
      return true;
    }),
});

// Methods --------------------------------------------------------------------------------------------------------

// Funtion simply takes client input and returns a two letter code for whichever semester was marked true
function getSemester(input: {
  tuid: string;
  semester_fall: boolean;
  semester_winter: boolean;
  semester_spring: boolean;
  semester_summer: boolean;
}) {
  let semester = "";
  if (input.semester_fall) semester = "FA";
  else if (input.semester_winter) semester = "WI";
  else if (input.semester_spring) semester = "SP";
  else if (input.semester_summer) semester = "SU";
  return semester;
}

// Function contains the query logic for finding courses attahced to a revision by day. The query is the same for each day, apart from the
// actual day being searched
async function queryCoursesByDay(
  input: {
    faculty?: string[] | undefined;
    credits?: number | undefined;
    buildings?: string[] | undefined;
    departments?: string[] | undefined;
    tuid: string;
    semester_summer: boolean;
    semester_fall: boolean;
    semester_winter: boolean;
    semester_spring: boolean;
    days: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    minRoomNum: string;
    maxRoomNum: string;
  },
  day?: string
) {
  const coursesByDay: RevisionWithCourses | null =
    // Query will find a revision based on tuid, then will find every course linked to that revision on the specified day, along with the faculty
    // teaching each course and the location(s)/time(s) the course is taught on the specified day (If a course is taught on Monday in one location
    // and on Wednesday in another location, only the Monday location will result from the Monday query, and so on)
    await prisma.scheduleRevision.findUnique({
      where: {
        tuid: input.tuid,
      },
      include: {
        courses: {
          where: {
            // Filter by a list of faculty tuids if it was provided by the client
            ...(input.faculty
              ? { faculty: { some: { faculty_tuid: { in: input.faculty } } } }
              : {}),

            // Filter by a list of department codes if it was provided by the client
            ...(input.departments
              ? { department: { in: input.departments } }
              : {}),

            // Filter by a certain number of credit hours if it was provided by the client
            ...(input.credits ? { credits: input.credits } : {}),

            // Filter by course location...
            locations: {
              every: {
                // ...if a course is taught in any location on a certain day
                ...(day != undefined
                  ? {
                      [day]: {
                        equals: true,
                      },
                    }
                  : {
                      day_monday: {
                        equals: false,
                      },
                      day_tuesday: {
                        equals: false,
                      },
                      day_wednesday: {
                        equals: false,
                      },
                      day_thursday: {
                        equals: false,
                      },
                      day_friday: {
                        equals: false,
                      },
                      day_saturday: {
                        equals: false,
                      },
                      day_sunday: {
                        equals: false,
                      },
                    }),

                // ...and if a course is taught in any location present within a list of buildings, if
                // said list of buildings is provided by the client
                ...(input.buildings
                  ? {
                      rooms: {
                        some: { building_tuid: { in: input.buildings } },
                      },
                    }
                  : {}),
              },
            },

            // Filter by semesters
            semester_fall: input.semester_fall,
            semester_winter: input.semester_winter,
            semester_spring: input.semester_spring,
            semester_summer: input.semester_summer,
          },

          include: {
            faculty: {
              include: {
                faculty: true,
              },
            },
            locations: {
              ...(day != undefined
                ? {
                    where: {
                      [day]: {
                        equals: true,
                      },
                    },
                  }
                : {
                    where: {
                      day_monday: {
                        equals: false,
                      },
                      day_tuesday: {
                        equals: false,
                      },
                      day_wednesday: {
                        equals: false,
                      },
                      day_thursday: {
                        equals: false,
                      },
                      day_friday: {
                        equals: false,
                      },
                      day_saturday: {
                        equals: false,
                      },
                      day_sunday: {
                        equals: false,
                      },
                    },
                  }),
              include: {
                rooms: {
                  include: {
                    building: day != undefined,
                  },
                },
              },
            },
          },
        },
      },
    });

  return coursesByDay;
}

/**
 * Tab Interface
 * The interface
 */
export interface ITab {
  title: string;
  name: string | null;
  semester: "FA" | "WI" | "SP" | "SU";
  revision: string;
}

export interface IRevisionSelect {
  value: ITab;
  label: string;
}
