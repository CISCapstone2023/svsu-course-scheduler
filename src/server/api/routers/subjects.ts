import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { Subject } from "@prisma/client";
import {
  createSubjectsSchema,
  updateSubjectsSchema,
} from "src/validation/subjects";
import { Prisma } from "@prisma/client";
import { update } from "lodash";

const TOTAL_RESULTS_PER_PAGE = 10;

//Router to carry out functions on subjects
export const subjectRouter = createTRPCRouter({
  //Router to pull all subjects
  getAllSubjects: protectedProcedure
    .input(
      z.object({
        //Takes input in as a zod object with the page attribute
        search: z.string(),
        page: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      let totalPages = 1;
      let subjectResult: Subject[] = [];

      if (input.search != "") {
        //Queries the database to grab all subjects and handles pagination
        subjectResult = await ctx.prisma.subject.findMany({
          take: TOTAL_RESULTS_PER_PAGE,
          skip: (input.page - 1) * TOTAL_RESULTS_PER_PAGE,
          where: {
            name: {
              contains: input.search,
            },
          },
        });
        //Queries the database for the total number of subjects in the subjects table, then calculates the total number of pagination pages
        const subjectCount = await ctx.prisma.subject.count({
          where: {
            name: {
              contains: input.search,
            },
          },
        });
        totalPages = Math.ceil(subjectCount / TOTAL_RESULTS_PER_PAGE);
      } else {
        subjectResult = await ctx.prisma.subject.findMany({
          take: TOTAL_RESULTS_PER_PAGE,
          skip: (input.page - 1) * TOTAL_RESULTS_PER_PAGE,
        });
        // Get the count of campuses and use it to compute total page count
        const subjectCount = await ctx.prisma.subject.count();
        totalPages = Math.ceil(subjectCount / TOTAL_RESULTS_PER_PAGE);
      }

      return {
        result: subjectResult,
        //Returns page that the user is on and total pages
        page: input.page,
        totalPages: totalPages,
      };
    }),

  //Router to pull all subjects to be autofilled
  getAllSubjectsAutofill: protectedProcedure.query(async ({ ctx, input }) => {
    //Queries the database to grab all subjects for autofill
    const subjectResult = await ctx.prisma.subject.findMany();

    return {
      //Returns the subject object with label, name, and value.
      result: subjectResult.map((subject) => {
        return {
          label: subject.name,
          value: subject.name,
          subject: subject.name,
        };
      }),
    };
  }),

  //Router to add a subject to the subject table
  addSubject: protectedProcedure
    .input(createSubjectsSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      //Runs a mutation on the database to add a new subject with the subject name that is passed in from client
      const subjectCreate = await ctx.prisma.subject.create({
        data: {
          name: input.name,
        },
      });
      return subjectCreate; //Returns the created subject
    }),

  // Router to delete a subject
  deleteSubject: protectedProcedure
    .input(
      z.object({
        //Takes in tuid from client on which subject to delete
        tuid: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //Runs a query to count how many subjects there are with the provided tuid
      const hasSubject = await ctx.prisma.subject.count({
        where: {
          tuid: input.tuid,
        },
      });

      //If the subject is found, it deletes the subject based on tuid
      if (hasSubject == 1) {
        await ctx.prisma.subject.delete({
          where: {
            tuid: input.tuid,
          },
        });
        //Returns true of delete was successful
        return true;
      }
      return false;
    }),

  //Router to update a subject
  updateSubject: protectedProcedure
    .input(updateSubjectsSchema)
    .mutation(async ({ ctx, input }) => {
      //Runs a query to count how many subjects there are with the provided tuid
      const hasSubject = await ctx.prisma.subject.count({
        where: {
          tuid: input.tuid,
        },
      });
      //If at least one subject exists it will update the subject with the data passed in from the client
      if (hasSubject == 1) {
        await ctx.prisma.subject.update({
          where: {
            tuid: input.tuid,
          },
          data: {
            name: input.name,
          },
        });
        //Returns true if update was successful
        return true;
      }
      return false;
    }),
});
