import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { Prisma, PrismaClient } from "@prisma/client";
import { Overwrite } from "@trpc/server";
import { Session } from "next-auth";

//import validation next
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
  getRevision: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
        fall: z.boolean(),
        winter: z.boolean(),
        spring: z.boolean(),
        summer: z.boolean(),
      })
    )
    .query(async ({ ctx, input }) => {
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

      return {
        revision_name: monday_courses?.name,
        semesters: "Placeholder", // Update this to show semester from input
        monday_courses: monday_courses?.courses,
        tuesday_courses: tuesday_courses?.courses,
        wednesday_courses: wednesday_courses?.courses,
        thursday_courses: thursday_courses?.courses,
        friday_courses: friday_courses?.courses,
        saturday_courses: saturday_courses?.courses,
        sunday_courses: sunday_courses?.courses,
      };
    }),

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
    fall: boolean;
    winter: boolean;
    spring: boolean;
    summer: boolean;
  },
  day: string
) {
  const coursesByDay: RevisionWithCourses | null =
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
