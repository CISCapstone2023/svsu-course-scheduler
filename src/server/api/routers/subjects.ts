import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { Subject } from "@prisma/client";
import {
  createSubjectsSchema,
  updateSubjectsSchema,
} from "src/validation/subjects";
import { Prisma } from "@prisma/client";

const TOTAL_RESULTS_PER_PAGE = 10;

export const subjectRouter = createTRPCRouter({
  getAllSubjectsAutofill: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      let subjectResult: Subject[] = [];
      let totalPages = 1;

      subjectResult = await ctx.prisma.subject.findMany({
        take: TOTAL_RESULTS_PER_PAGE,
        skip: (input.page - 1) * TOTAL_RESULTS_PER_PAGE,
      });
      const subjectCount = await ctx.prisma.subject.count();
      totalPages = Math.ceil(subjectCount / TOTAL_RESULTS_PER_PAGE);

      return {
        result: subjectResult,
        page: input.page,
        totalPages: totalPages,
      };
    }),
});
