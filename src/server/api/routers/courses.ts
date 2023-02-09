import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { GuidelinesCourses } from "@prisma/client";

export const coursesRouter = createTRPCRouter({
  getAllCourseGuidelines: protectedProcedure
    .input(
      z.object({
        search: z.string(),
        page: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let courseGuidelinesResult: GuidelinesCourses[] = [];

      if (input.search != "") {
      } else {
        courseGuidelinesResult = await ctx.prisma.guidelinesCourses.findMany({
          take: 10,

          skip: input.page * 10,
        });
      }

      return {
        result: courseGuidelinesResult,
        page: input.page,
      };
    }),

  addCourseGuideline: protectedProcedure.query(() => {
    return null;
  }),

  deleteCourseGuideline: protectedProcedure.query(() => {
    return null;
  }),
});
