import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import {
  createFacultySchemaNoTUID,
  createFacultySchemaWithTUID,
  createFacultySchemaTUID,
} from "src/validation/faculty";

//faculty router that will add, delete, update, and get faculty from database
export const facultyRouter = createTRPCRouter({
  //add faculty protected procedure to add one faculty member
  addFaculty: protectedProcedure
    //use the zod object schema from validation/faculty
    .input(createFacultySchemaNoTUID)
    //async mutation to create a new faculty memeber
    .mutation(async ({ ctx, input }) => {
      //await the creation of the faculty member
      await ctx.prisma.guidelinesFaculty.create({
        //store the input from client in the data field to be written to database
        data: {
          suffix: input.suffix,
          last_name: input.last_name,
          first_name: input.first_name,
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
  getAllFaculty: protectedProcedure.query(async ({ ctx }) => {
    //set constant as a list of faculty objects
    const data = await ctx.prisma.guidelinesFaculty.findMany();
    //send said list to the client
    return data;
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
          last_name: input.last_name,
          first_name: input.first_name,
          email: input.email,
          is_adjunct: input.is_adjunct,
        },
      });
      //return the updated faculty member to the client
      return updatedFaculty;
    }),
});
