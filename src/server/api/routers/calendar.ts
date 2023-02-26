import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { Prisma } from "@prisma/client";
import { prisma } from "src/server/db";
import { createCourseSchema } from "src/server/api/routers/projects";
import { courseSchema } from "src/validation/courses";

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
          include: { rooms: true },
        },
      },
    },
  },
});
export type RevisionWithCourses = Prisma.ScheduleRevisionGetPayload<
  typeof revisionWithCourses
>;

const courseType = Prisma.validator<Prisma.CourseArgs>()({
  include: {
    faculty: {
      include: { faculty: true },
    },
    locations: {
      include: { rooms: true },
    },
  },
});
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
                        // AND:[
                        //   ...course.locations.map((location) =>{
                        //     return {
                        //       start_time: location.start_time,
                        //       end_time: location.end_time,}
                        //   })
                        // ],
                        start_time: course.start_time,
                        end_time: course.end_time,
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

      console.log({
        m: monday_courses,
        t: tuesday_courses,
        w: monday_courses,
        th: monday_courses,
        f: monday_courses,
      });

      const within = {
        monday_courses: await coursesWithinAGuideline(monday_courses),
        tuesday_courses: await coursesWithinAGuideline(tuesday_courses),
        wednesday_courses: await coursesWithinAGuideline(wednesday_courses),
        thursday_courses: await coursesWithinAGuideline(thursday_courses),
        friday_courses: await coursesWithinAGuideline(friday_courses),
        saturday_courses: await coursesWithinAGuideline(saturday_courses),
        sunday_courses: await coursesWithinAGuideline(sunday_courses),
      };

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
      };

      console.log(out);
      return out;
    }),

  // This just grabs one course by its tuid
  getCourse: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findUnique({
        where: {
          tuid: input.tuid,
        },
      });

      return {
        course,
      };
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

  //This will add a new course to a revision in the add course box
  addNewRevisonCourse: protectedProcedure
    .input(
      z.object({
        //Input comes in as a revision tuid and a courseSchema variable
        tuid: z.string(),
        course: courseSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      //
      let isSuccess = true; //Defines and initializes a boolean to store whether or not parse is successful
      if (input.course != undefined) {
        //Checks to see if the input course is undefined
        const isSafe = courseSchema.safeParse(input.course); //If it is, conducts a safeParse on the input and stores the object of the parse

        if (!isSafe.success) {
          //Checks if the provided input is safe based on the return of the parse
          isSuccess = false; //If not, then isSuccess is set to false
          console.log(isSafe.error); //And error is printed to console
        }
      }
      if (isSuccess) {
        //If parse was successful then...
        const createNewCourse = await ctx.prisma.course.create(
          //Create a new course in course table
          createCourseSchema(input.course as any, input.tuid as any) //Calls the course creation schema and passes in course and tuid as any
          //There was an issue with the typing as it was passed in so these parameters are casted to type 'any'
        );

        await ctx.prisma.scheduleRevision.update({
          //Performs an update on the scheduleRevision table
          where: {
            //Where the tuid is equal to the tuid passed in for the revision
            tuid: input.tuid,
          },
          data: {
            courses: {
              //Updates the courses relation by connecting the newly created course to said revision
              connect: [createNewCourse],
            },
          },
        });
      }
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
  day: string
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
              some: {
                // ...if a course is taught in any location on a certain day
                [day]: {
                  equals: true,
                },

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
              where: {
                [day]: {
                  equals: true,
                },
              },
              include: {
                rooms: true,
              },
            },
          },
        },
      },
    });

  return coursesByDay;
}
