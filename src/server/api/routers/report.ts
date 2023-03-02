import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { Course, GuidelinesFaculty } from "@prisma/client";

export const reportRouter = createTRPCRouter({
  getAllReports: protectedProcedure
    .input(
      z.object({
        semester_fall: z.boolean(),
        semester_winter: z.boolean(),
        semester_spring: z.boolean(),
        semester_summer: z.boolean(),
        search: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      let courseResult: GuidelinesFaculty[] = [];
      //do we have a search query
      if (input.search != "") {
        courseResult = await ctx.prisma.guidelinesFaculty.findMany({
          where: {
            name: input.search,
          },
          distinct: ["name"],
          include: {
            to_courses: true,
          },
        });

        console.log(courseResult);
      } else {
        courseResult = await ctx.prisma.guidelinesFaculty.findMany({
          where: {},
          distinct: ["name"],
          include: {
            to_courses: true,
          },
        });

        console.log(courseResult);
      }
    }),
});
