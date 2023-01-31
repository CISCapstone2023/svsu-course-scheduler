import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { GuidelineCampus } from "@prisma/client";
import {
  createCampusSchema,
  updateCampusSchema,
} from "src/validation/buildings";

export const buildingsRouter = createTRPCRouter({
  //Get all campus and return the list of campus
  getAllCampus: protectedProcedure
    .input(
      z.object({
        search: z.string(),
        page: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      //Create a list of campuses from the type generated by prisma
      let campusResult: GuidelineCampus[] = [];

      //Do we have a search query
      if (input.search != "") {
        campusResult = await ctx.prisma.guidelineCampus.findMany({
          //We want 10
          take: 10,
          //We start at 0
          skip: input.page * 10,
          where: {
            name: {
              contains: input.search,
            },
          },
        });
      } else {
        //If we don't have a search query don't worry about the filter
        campusResult = await ctx.prisma.guidelineCampus.findMany({
          //We want 10
          take: 10,
          //We start at 0
          skip: input.page * 10,
        });
      }

      //Return the data
      return {
        result: campusResult,
        page: input.page,
      };
    }),
  addCampus: protectedProcedure
    .input(createCampusSchema)
    .mutation(async ({ ctx, input }) => {
      const campus = await ctx.prisma.guidelineCampus.create({
        data: {
          name: input.name,
        },
      });
      console.log(campus);
      return campus;
    }),
  deleteCampus: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //First we need to check if we have a campus via count
      //This is done by selecting the tuid of the Campus passed
      //by the client
      const hasCampus = await ctx.prisma.guidelineCampus.count({
        where: {
          tuid: input.tuid,
        },
      });
      //Make sure to delete it if it exists
      if (hasCampus == 1) {
        await ctx.prisma.guidelineCampus.delete({
          where: {
            tuid: input.tuid,
          },
        });
        //Deletion was successful
        return true;
      }

      //Could not delete it
      return false;
    }),
  updateCampus: protectedProcedure
    .input(updateCampusSchema)
    .mutation(async ({ ctx, input }) => {
      //Find if the campus exists
      const hasCampus = await ctx.prisma.guidelineCampus.count({
        where: {
          tuid: input.tuid,
        },
      });
      //Make the campus exists
      if (hasCampus == 1) {
        await ctx.prisma.guidelineCampus.update({
          where: {
            tuid: input.tuid,
          },
          data: {
            name: input.name,
          },
        });
        return true;
      }
      //If there is no campus to update, let the frontend know
      return false;
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
