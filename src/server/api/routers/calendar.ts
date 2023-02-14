import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { Prisma, PrismaClient } from "@prisma/client";
import { Overwrite } from "@trpc/server";
import { Session } from "next-auth";

// Import validation next
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

export const calendarRouter = createTRPCRouter({
  // This will grab one revision by tuid and return all courses attached to it, organized by days of the week
  getRevision: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
        faculty: z.string().array(), // tuids
        buildings: z.string().array(), // tuids
        departments: z.string().array(), // name
        credits: z.number(),
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
      const monday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(ctx, input, "day_monday");
      const tuesday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(ctx, input, "day_tuesday");
      const wednesday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(ctx, input, "day_wednesday");
      const thursday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(ctx, input, "day_thursday");
      const friday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(ctx, input, "day_friday");
      const saturday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(ctx, input, "day_saturday");
      const sunday_courses: RevisionWithCourses | null =
        await queryCoursesByDay(ctx, input, "day_sunday");

      // Use the semester input booleans to return what specific semester we are looking for
      const semester = getSemester(input);

      // Send the client back the ame of the revision, the semester, and the results of each of the course-by-day queries
      return {
        revision_name: monday_courses?.name,
        semesters: semester,
        monday_courses: monday_courses?.courses,
        tuesday_courses: tuesday_courses?.courses,
        wednesday_courses: wednesday_courses?.courses,
        thursday_courses: thursday_courses?.courses,
        friday_courses: friday_courses?.courses,
        saturday_courses: saturday_courses?.courses,
        sunday_courses: sunday_courses?.courses,
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
});

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
  ctx: Overwrite<
    {
      session: Session | null;
      prisma: PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
      >;
    },
    {
      session: {
        user: { id: string } & {
          name?: string | null | undefined;
          email?: string | null | undefined;
          image?: string | null | undefined;
        };
        expires: string;
      };
    }
  >,
  input: {
    tuid: string;
    semester_fall: boolean;
    semester_winter: boolean;
    semester_spring: boolean;
    semester_summer: boolean;
  },
  day: string
) {
  const coursesByDay: RevisionWithCourses | null =
    // Query will find a revision based on tuid, then will find every course linked to that revision on the specified day, along with the faculty
    // teaching each course and the location(s)/time(s) the course is taught on the specified day (If a course is taught on Monday in one location
    // and on Wednesday in another location, only the Monday location will result from the Monday query, and so on)
    await ctx.prisma.scheduleRevision.findUnique({
      where: {
        tuid: input.tuid,
      },
      include: {
        courses: {
          where: {
            locations: {
              some: {
                [day]: {
                  equals: true,
                },
              },
            },
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
