import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "src/server/api/trpc";
import { Department } from "@prisma/client";
import {
  createDepartmentsSchema,
  updateDepartmentsSchema,
} from "src/validation/departments";

/**
 * Department Router that will allow for adding, removing, deleting and querying
 * of the Departments table
 * @author Chris Bellefeuille
 */
export const departmentRouter = createTRPCRouter({
  /**
   * Add Department protected procedure to add a single department
   * @author Chris Bellefeuille
   */
  addDepartment: protectedProcedure
    .input(createDepartmentsSchema)
    //async mutation to create a new department
    .mutation(async ({ ctx, input }) => {
      //await the creation of the new department
      await ctx.prisma.department.create({
        data: {
          name: input.name,
        },
      });
      //department has been added
      return true;
    }),

  /**
   * Delete Department protected procedure to delete a single department
   * @author Chris Bellefeuille
   */
  deleteDepartment: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //query department and get the number of departments with the given tuid
      const hasDepartment = await ctx.prisma.department.count({
        where: {
          tuid: input.tuid,
        },
      });
      //check that there is exactly one department with the given tuid
      if (hasDepartment == 1) {
        //delete the department with the given tuid
        await ctx.prisma.department.delete({
          where: {
            tuid: input.tuid,
          },
        });
        //department has been deleted
        return true;
      }
      //could not be deleted
      return false;
    }),

  /**
   * Update Department protected procedure to update a single department based on the given TUID
   * @author Chris Bellefeuille
   */
  updateDepartment: protectedProcedure
    .input(updateDepartmentsSchema)
    .mutation(async ({ ctx, input }) => {
      //Find if the department exists
      const hasDepartment = await ctx.prisma.department.count({
        where: {
          tuid: input.tuid,
        },
      });
      //Make the department exists
      if (hasDepartment == 1) {
        await ctx.prisma.department.update({
          where: {
            tuid: input.tuid,
          },
          data: {
            name: input.name,
          },
        });
        return true;
      }
      //If there is no department to update, let the frontend know
      return false;
    }),

  /**
   * Query to get all the departments also allowing for searching
   * @author Chris Bellefeuille
   */
  getAllDepartments: protectedProcedure
    .input(
      z.object({
        search: z.string(),
        page: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      //create a list of departments from the type generated by prisma
      let departmentResult: Department[] = [];
      let totalPages = 0;
      const resultsPerPage = 10;
      //do we have a search query
      if (input.search != "") {
        departmentResult = await ctx.prisma.department.findMany({
          //we want 10
          take: resultsPerPage,
          skip: (input.page - 1) * resultsPerPage,
          //check if the search criteria meets the department name
          where: {
            OR: [
              {
                name: {
                  contains: input.search,
                },
              },
            ],
          },
        });

        /**
         * Department Count
         *
         * Count the total departments
         */
        const departmentCount = await ctx.prisma.department.count({
          where: {
            OR: [
              {
                name: {
                  contains: input.search,
                },
              },
            ],
          },
        });
        totalPages = Math.ceil(departmentCount / resultsPerPage);
      } else {
        //if we don't have a search query, don't worry about the filter
        departmentResult = await ctx.prisma.department.findMany({
          //we want 10
          take: resultsPerPage,
          //we start at 0
          skip: (input.page - 1) * resultsPerPage,
        });

        /**
         * DepartmentCount
         *
         * Count the total Departments
         */
        const departmentCount = await ctx.prisma.department.count();
        totalPages = Math.ceil(departmentCount / resultsPerPage);
      }
      //send said list to the client
      return {
        result: departmentResult,
        page: input.page,
        totalPages: totalPages,
      };
    }),

  /**
   * Query to get all the departments for the select input box
   * @author Chris Bellefeuille
   */
  getAllDepartmentsSelect: publicProcedure.query(async ({ ctx }) => {
    //create a list of departments from the type generated by prisma
    let departmentResult: Department[] = [];
    departmentResult = await ctx.prisma.department.findMany({});
    return {
      result: departmentResult,
    };
  }),

  //mutation that will return a list of departments based on the dropdown search
  getAllDepartmentAutofill: protectedProcedure
    .input(
      z.object({
        search: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //query to find all departments matching the search if there is a search
      const departmentData = await ctx.prisma.department.findMany({
        ...(input.search != ""
          ? {
              where: {
                name: {
                  contains: input.search,
                },
              },
            }
          : {}),
      });

      return departmentData.map((department) => {
        //maps the departmentData array returned
        return {
          label: department.name,
          value: department.name,
          name: department.name,
        }; //returns the data mapped to the label and values needed
      });
    }),
});
