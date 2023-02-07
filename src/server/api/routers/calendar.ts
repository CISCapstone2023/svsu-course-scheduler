import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { Prisma } from "@prisma/client";

//import validation next
const revisionWithCourses = Prisma.validator<Prisma.ScheduleRevisionArgs>()({
  include: { courses: true },
});
type RevisionWithCourses = Prisma.ScheduleRevisionGetPayload<
  typeof revisionWithCourses
>;

export const calendarRouter = createTRPCRouter({
  getRevision: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // let revisionResult: RevisionWithCourses | null;

      const revisionResult: RevisionWithCourses | null =
        await ctx.prisma.scheduleRevision.findUnique({
          where: {
            tuid: input.tuid,
          },
          include: {
            courses: true,
          },
        });

      return {
        revisionResult,
      };
    }),
});
