import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "src/server/api/trpc";
import { GuidelineCampus, GuidelinesCourses } from "@prisma/client";
import { createCampusSchema } from "src/validation/buildings";

export const buildingsRouter = createTRPCRouter({
  //Get all campus and return the list of campus
  getAllCampus: protectedProcedure
    .input(
      z.object({
        search: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      let campusResult: GuidelineCampus[] = [];

      //Do we have a search query
      if (input.search != "") {
        campusResult = await ctx.prisma.guidelineCampus.findMany({
          take: 10,
          skip: 0,
          where: {
            name: {
              contains: input.search,
            },
          },
        });
      } else {
        //If we don't have a search query don't worry about the filter
        campusResult = await ctx.prisma.guidelineCampus.findMany({
          take: 10,
          skip: 0,
        });
      }

      //Return the data
      return campusResult;
    }),
  addCampus: protectedProcedure
    .input(createCampusSchema)
    .mutation(async ({ ctx, input }) => {
      //Add a mew campus

      const campus = await ctx.prisma.guidelineCampus.create({
        data: {
          name: input.name,
        },
      });
      console.log(campus);
      return {
        result: campus,
      };
    }),
  deleteCampus: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return {};
    }),
  getCampus: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const campus = await ctx.prisma.guidelineCampus.findUnique({
        where: {
          tuid: input.tuid,
        },
      });

      return {
        campus,
      };
    }),
});