import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import {
  createFacultySchema,
  createFacultySchemaWithTUID,
  createFacultySchemaTUID,
} from "src/validation/faculty";
import type { GuidelinesFaculty } from "@prisma/client";

//faculty router that will add, delete, update, and get faculty from database
export const facultyRouter = createTRPCRouter({
  //add faculty protected procedure to add one faculty member
  addFaculty: protectedProcedure
    //use the zod object schema from validation/faculty
    .input(createFacultySchema)
    //async mutation to create a new faculty memeber
    .mutation(async ({ ctx, input }) => {
      //await the creation of the faculty member
      await ctx.prisma.guidelinesFaculty.create({
        //store the input from client in the data field to be written to database
        data: {
          suffix: input.suffix,
          name: input.name,
          email: input.email,
          is_adjunct: input.is_adjunct,
        },
      });
      //faculty has been added
      return true;
    }),

  //delete one faculty protected procedure to delete a single faculty memeber
  deleteOneFaculty: protectedProcedure
    //here we will take in just the tuid as an input from client
    .input(createFacultySchemaTUID)
    //async mutation to handle the deletion
    .mutation(async ({ ctx, input }) => {
      //first get the count of current list of faculty in the database
      const hasFaculty = await ctx.prisma.guidelinesFaculty.count({
        //check based on the client input of tuid
        where: {
          tuid: input.tuid,
        },
      });
      //check that there is exactly one faculty with the given tuid
      if (hasFaculty == 1) {
        //delete the given faculty member with client tuid
        await ctx.prisma.guidelinesFaculty.delete({
          where: {
            tuid: input.tuid,
          },
        });
        //faculty has been deleted
        return true;
      }
      //could not be deleted
      return false;
    }),

  //get all faculty protected procedure to retrieve and return all faculty members
  getAllFaculty: protectedProcedure
    .input(
      z.object({
        search: z.string(),
        page: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      //create a list of faculty from the type generated by prisma
      let facultyResult: GuidelinesFaculty[] = [];
      let totalPages = 0;
      const resultsPerPage = 10;
      //do we have a search query
      if (input.search != "") {
        facultyResult = await ctx.prisma.guidelinesFaculty.findMany({
          //we want 10
          take: resultsPerPage,
          //we start at 0
          skip: (input.page - 1) * resultsPerPage,
          //check if the first name and/or last name are being searched for
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
         * FacultyCount
         *
         * Count the total faculty members
         */
        const facultyCount = await ctx.prisma.guidelinesFaculty.count({
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
        totalPages = Math.ceil(facultyCount / resultsPerPage);
      } else {
        //if we don't have a search query, don't worry about the filter
        facultyResult = await ctx.prisma.guidelinesFaculty.findMany({
          //we want 10
          take: resultsPerPage,
          //we start at 0
          skip: (input.page - 1) * resultsPerPage,
        });

        /**
         * FacultyCount
         *
         * Count the total faculty members
         */
        const facultyCount = await ctx.prisma.guidelinesFaculty.count();
        totalPages = Math.ceil(facultyCount / resultsPerPage);
      }
      //send said list to the client
      return {
        result: facultyResult,
        page: input.page,
        totalPages: totalPages,
      };
    }),

  //get one faculty protected procedure to retrieve and return a single faculty member
  getOneFaculty: protectedProcedure
    .input(createFacultySchemaTUID)
    .query(async ({ ctx, input }) => {
      //set constant as a faculty object
      const data = await ctx.prisma.guidelinesFaculty.findUnique({
        where: {
          tuid: input.tuid,
        },
      });
      //send the found faculty object to the client
      return data;
    }),

  //updated faculty protected procedure to update a single faculty member retrieved from
  //the client and return the updated faculty member
  updateFaculty: protectedProcedure
    //grab client input using the withTuid schema found in validation/faculty.ts
    .input(createFacultySchemaWithTUID)
    //async mutation to run the update
    .mutation(async ({ ctx, input }) => {
      //set constant as the updated faculty member where the tuid matches the one passed
      //in by the client
      const updatedFaculty = await ctx.prisma.guidelinesFaculty.update({
        where: {
          tuid: input.tuid,
        },
        data: {
          tuid: input.tuid,
          suffix: input.suffix,
          name: input.name,
          email: input.email,
          is_adjunct: input.is_adjunct,
        },
      });
      //return the updated faculty member to the client
      return updatedFaculty;
    }),

  getRevisionCourseFaculty: protectedProcedure
    .input(
      z.object({
        //Creates an object to take input from the front end as a string for searching a faculty member
        search: z.string(), //Sets the validation for search as a string
      })
    )
    .query(async ({ ctx, input }) => {
      let facultyDataArr = [];

      if (input.search != "") {
        //Determines if the string input is not empty. If not, it runs the query.
        const facultyData = await ctx.prisma.guidelinesFaculty.findMany({
          //Query finds many faculty members from the GuidelinesFaculty table
          where: {
            //looks for any faculty records where their name contains the search string put in the front end
            name: {
              contains: input.search,
            },
          },
          select: {
            //Selects the tuid and name to return to the client from the records queried
            tuid: true,
            name: true,
          },
        });

        facultyData.forEach((faculty) => {
          //Iterates over the findMany query and pushes the data into an array of the custom object type needed at the client
          facultyDataArr.push({ value: faculty.tuid, label: faculty.name });
        });

        return facultyDataArr; //Returns the facultyData including tuid and namew to the client
      }
    }),
});
