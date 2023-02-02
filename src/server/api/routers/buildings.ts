import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { GuidelineCampus, GuidelineBuilding } from "@prisma/client";
import {
  createCampusSchema,
  updateCampusSchema,
  createBuildingSchema,
  updateBuildingSchema,
} from "src/validation/buildings";

export const buildingsRouter = createTRPCRouter({
  // Campuses -------------------------------------------------------------------------------------

  //Get all campus and return the list of campus
  getAllCampus: protectedProcedure
    .input(
      z.object({
        search: z.string(),
        page: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      //Create a list of campuses from the type generated by prisma
      let campusResult: GuidelineCampus[] = [];
      let totalPages = 1;
      const resultsPerPage = 10;

      //Do we have a search query
      if (input.search != "") {
        campusResult = await ctx.prisma.guidelineCampus.findMany({
          //We want 10
          take: resultsPerPage,
          //We start at 0
          skip: input.page - 1 * resultsPerPage,
          where: {
            name: {
              contains: input.search,
            },
          },
        });

        // Get the count of campuses within search parameters and use it to compute total page count
        const campusCount = await ctx.prisma.guidelineCampus.count({
          where: {
            name: {
              contains: input.search,
            },
          },
        });
        totalPages = Math.ceil(campusCount / resultsPerPage);
      } else {
        //If we don't have a search query don't worry about the filter
        campusResult = await ctx.prisma.guidelineCampus.findMany({
          //We want 10
          take: resultsPerPage,
          //We start at 0
          skip: (input.page - 1) * resultsPerPage,
        });

        // Get the count of campuses and use it to compute total page count
        const campusCount = await ctx.prisma.guidelineCampus.count();
        totalPages = Math.ceil(campusCount / resultsPerPage);
      }

      //Return the data
      return {
        result: campusResult,
        page: input.page,
        totalPages: totalPages,
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

  // Buildings ------------------------------------------------------------------------------------

  getAllBuildings: protectedProcedure
    // Get all buildings and return the list of buildings
    .input(
      z.object({
        search: z.string(),
        page: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Create a list of buildings from the type generated by prisma
      let buildingResult: GuidelineBuilding[] = [];
      let totalPages = 0;
      const resultsPerPage = 10;

      // Do we have a search query
      if (input.search != "") {
        buildingResult = await ctx.prisma.guidelineBuilding.findMany({
          // We want 10
          take: resultsPerPage,
          // We start at 0
          skip: input.page * resultsPerPage,
          where: {
            name: {
              contains: input.search,
            },
          },
        });

        // Get the count of buildings within search parameters and use it to compute total page count
        const buildingCount = await ctx.prisma.guidelineBuilding.count({
          where: {
            name: {
              contains: input.search,
            },
          },
        });
        totalPages = Math.ceil(buildingCount / resultsPerPage);
      } else {
        // If we don't have a search query don't worry about the filter
        buildingResult = await ctx.prisma.guidelineBuilding.findMany({
          // We want 10
          take: resultsPerPage,
          // We start at 0
          skip: input.page * resultsPerPage,
        });

        // Get the count of buildings and use it to compute total page count
        const buildingCount = await ctx.prisma.guidelineBuilding.count();
        totalPages = Math.ceil(buildingCount / resultsPerPage);
      }

      // Return the data
      return {
        result: buildingResult,
        page: input.page,
        totalPages: totalPages,
      };
    }),

  // UNIFINISHED ---------------------
  addBuilding: protectedProcedure
    .input(createBuildingSchema)
    .mutation(async ({ ctx, input }) => {
      // Add a new building
      const building = await ctx.prisma.guidelineBuilding.create({
        data: {
          campus_tuid: input.campus_tuid,
          name: input.name,
          prefix: input.prefix.toUpperCase(),
          classrooms: input.classrooms,
        },
      });

      console.log(building);

      return {
        result: building,
      };
    }),

  deleteBuilding: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First we need to check if we have a building via count.
      // This is done by selecting the tuid of the building passed
      // by the client
      const hasBuilding = await ctx.prisma.guidelineBuilding.count({
        where: {
          tuid: input.tuid,
        },
      });
      // Make sure to delete it if it exists
      if (hasBuilding == 1) {
        await ctx.prisma.guidelineBuilding.delete({
          where: {
            tuid: input.tuid,
          },
        });

        // Deletion was successful
        return true;
      }

      // Could not delete it
      return false;
    }),

  // UNIFINISHED ---------------------
  updateBuilding: protectedProcedure
    .input(updateBuildingSchema)
    .mutation(async ({ ctx, input }) => {
      // Find if the building exists
      const hasBuilding = await ctx.prisma.guidelineBuilding.count({
        where: {
          tuid: input.tuid,
        },
      });
      // Make sure the building exists
      if (hasBuilding == 1) {
        await ctx.prisma.guidelineBuilding.update({
          where: {
            tuid: input.tuid,
          },
          data: {
            name: input.name,
            prefix: input.prefix,
          },
        });
        return true;
      }
      // If there is no building to update, let the frontend know
      return false;
    }),

  getBuilding: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const building = await ctx.prisma.guidelineCampus.findUnique({
        where: {
          tuid: input.tuid,
        },
      });

      return {
        building,
      };
    }),
});
