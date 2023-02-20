import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import {
  CourseLocation,
  CourseState,
  GuidelinesFaculty,
  GuidelinesFacultyToCourse,
  Prisma,
  PrismaClient,
  Room,
} from "@prisma/client";
import { Overwrite } from "@trpc/server";
import { Session } from "next-auth";

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
type RevisionWithCourses = Prisma.ScheduleRevisionGetPayload<
  typeof revisionWithCourses
>;

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
      const coursesByDay = await ctx.prisma.$transaction(async (tx) => {
        const monday_courses: RevisionWithCourses | null =
          await queryCoursesByDay(tx, input, "day_monday");
        const tuesday_courses: RevisionWithCourses | null =
          await queryCoursesByDay(tx, input, "day_tuesday");
        const wednesday_courses: RevisionWithCourses | null =
          await queryCoursesByDay(tx, input, "day_wednesday");
        const thursday_courses: RevisionWithCourses | null =
          await queryCoursesByDay(tx, input, "day_thursday");
        const friday_courses: RevisionWithCourses | null =
          await queryCoursesByDay(tx, input, "day_friday");
        const saturday_courses: RevisionWithCourses | null =
          await queryCoursesByDay(tx, input, "day_saturday");
        const sunday_courses: RevisionWithCourses | null =
          await queryCoursesByDay(tx, input, "day_sunday");

        return {
          monday_courses,
          tuesday_courses,
          wednesday_courses,
          thursday_courses,
          friday_courses,
          saturday_courses,
          sunday_courses,
        };
      });

      // Use the semester input booleans to return what specific semester we are looking for
      const semester = getSemester(input);

      const coursesWithinAGuideline = async (
        revision: RevisionWithCourses | null
      ) => {
        const out = await Promise.all(
          revision!.courses.map(async (course) => {
            //Check to make sure at least one location has a monday
            const hasMonday = course.locations.some((location) => {
              return location.day_monday === true;
            });
            console.log(hasMonday);
            console.log(revision?.courses.length);
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
                credits: course.credits,
                meeting_amount: totalMeetings, //This won't suffice
                days: {
                  every: {
                    AND: [
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
                times: {
                  every: {
                    start_time: course.start_time,
                    end_time: course.end_time,
                  },
                },
              },
            });

            const output = {
              withinGuideline: result > 0,
              ...course,
            } as Partial<RevisionWithCourses> & { withinGuideline: boolean };

            //Get all course data but also add a new boolean value to
            //make sure its within the course guideline
            return output;
          })
        );
        return out;
      };

      // Send the client back the ame of the revision, the semester, and the results of each of the course-by-day queries
      return {
        revision_name: coursesByDay.monday_courses?.name,
        semesters: semester,
        monday_courses: await coursesWithinAGuideline(
          coursesByDay.monday_courses
        ),
        tuesday_courses: await coursesWithinAGuideline(
          coursesByDay.tuesday_courses
        ),
        wednesday_courses: await coursesWithinAGuideline(
          coursesByDay.wednesday_courses
        ),
        thursday_courses: await coursesWithinAGuideline(
          coursesByDay.thursday_courses
        ),
        friday_courses: await coursesWithinAGuideline(
          coursesByDay.friday_courses
        ),
        saturday_courses: await coursesWithinAGuideline(
          coursesByDay.saturday_courses
        ),
        sunday_courses: await coursesWithinAGuideline(
          coursesByDay.sunday_courses
        ),
      };
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
  tx: Prisma.TransactionClient,
  input: {
    faculty?: string[] | undefined;
    credits?: number | undefined;
    buildings?: string[] | undefined;
    departments?: string[] | undefined;
    tuid: string;
    semester_summer: boolean;
    semester_fall: boolean;
    semester_winter: boolean;
    semester_spring: // Import validation next
    // Essentially creates a new data tyoe built to store comprehensive queries for the calendar
    boolean;
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
    await tx.scheduleRevision.findUnique({
      where: {
        tuid: input.tuid,
      },
      include: {
        courses: {
          where: {
            ...(input.faculty
              ? { faculty: { some: { faculty_tuid: { in: input.faculty } } } }
              : {}),

            ...(input.departments
              ? { department: { in: input.departments } }
              : {}),

            ...(input.credits ? { credits: input.credits } : {}),

            locations: {
              some: {
                [day]: {
                  equals: true,
                },

                ...(input.buildings
                  ? {
                      rooms: {
                        some: { building_tuid: { in: input.buildings } },
                      },
                    }
                  : {}),
              },
            },

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
