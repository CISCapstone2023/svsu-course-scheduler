import { z } from "zod";
import { set } from "date-fns";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import {
  GuidelinesCourses,
  GuidelinesCoursesTimes,
  GuidelinesCoursesDays,
  Prisma,
} from "@prisma/client";
import {
  addGuidelineSchema,
  updateCourseGuidelineSchema,
} from "src/validation/courses";
import { updateCampusSchema } from "src/validation/buildings";
import { cssTransition } from "react-toastify";

//Imports course guidelines schema with days and times
const courseGuidelinesTD = Prisma.validator<Prisma.GuidelinesCoursesArgs>()({
  include: { times: true, days: true },
});
type CourseGuidelinesTimeAndDays = Prisma.GuidelinesCoursesGetPayload<
  typeof courseGuidelinesTD
>;

//Creates courses trpc router
export const coursesRouter = createTRPCRouter({
  //Procedure to list all current course guidelines in the system
  getAllCourseGuidelines: protectedProcedure
    //Defines the input for the system as a zod object
    .input(
      z.object({
        //Defines object booleans for the term the guideline applies to
        semester_summer: z.boolean().default(false),
        semester_fall: z.boolean().default(false),
        semester_winter: z.boolean().default(false),
        semester_spring: z.boolean().default(false),

        //Defines the min and max value for the credits along with defaults
        credits: z
          .object({
            min: z.number().min(1).default(1),
            max: z.number().max(4).default(4),
          })
          .default({ min: 1, max: 4 }),

        //Defines the min and max values for the meeting amounts including defaults
        meeting_total: z
          .object({
            min: z.number().min(1).default(1),
            max: z.number().max(4).default(4),
          })
          .default({ min: 1, max: 4 }),

        //Defines the min and max hours and minutes for the course guideline start time
        start_time: z
          .object({
            hour: z.number().min(0).max(24).default(8),
            minute: z.number().min(0).max(60).default(30),
          })
          .default({ hour: 1, minute: 30 }),

        //Defines the min and max hours and minutes for the course guideline end time
        end_time: z
          .object({
            hour: z.number().min(0).max(24).default(22),
            minute: z.number().min(0).max(60).default(0),
          })
          .default({ hour: 23, minute: 30 }),

        //Defines the booleans for the day of the week the guideline applies to
        days: z
          .object({
            monday: z.boolean().default(false),
            tuesday: z.boolean().default(false),
            wednesday: z.boolean().default(false),
            thursday: z.boolean().default(false),
            friday: z.boolean().default(false),
            saturday: z.boolean().default(false),
            sunday: z.boolean().default(false),
          })
          .default({
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
          }),

        //Defines the page number and default value
        page: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let courseGuidelinesResult: CourseGuidelinesTimeAndDays[] = [];
      //Defines the query to find the guidelines based on the selected filters
      courseGuidelinesResult = await ctx.prisma.guidelinesCourses.findMany({
        where: {
          AND: [
            {
              OR: [
                input.semester_summer
                  ? {
                      semester_summer: input.semester_summer,
                    }
                  : {},
                input.semester_fall
                  ? {
                      semester_fall: input.semester_fall,
                    }
                  : {},
                input.semester_winter
                  ? {
                      semester_winter: input.semester_winter,
                    }
                  : {},
                input.semester_spring
                  ? {
                      semester_spring: input.semester_spring,
                    }
                  : {},
              ],
            },
            {
              credits: {
                lte: input.credits.max,
              },
            },
            {
              credits: {
                gte: input.credits.min,
              },
            },
            {
              meeting_amount: {
                lte: input.meeting_total.max,
              },
            },
            {
              meeting_amount: {
                gte: input.meeting_total.min,
              },
            },
            {
              days: {
                some: {
                  OR: [
                    input.days.monday
                      ? {
                          day_monday: {
                            equals: input.days.monday,
                          },
                        }
                      : {},
                    input.days.tuesday
                      ? {
                          day_tuesday: {
                            equals: input.days.tuesday,
                          },
                        }
                      : {},
                    input.days.wednesday
                      ? {
                          day_wednesday: {
                            equals: input.days.wednesday,
                          },
                        }
                      : {},
                    input.days.thursday
                      ? {
                          day_thursday: {
                            equals: input.days.thursday,
                          },
                        }
                      : {},
                  ],
                },
              },

              times: {
                some: {
                  AND: [
                    {
                      start_time_hour: {
                        gte: input.start_time.hour,
                      },
                      // start_time_min: {
                      //   gte: input.start_time.minute,
                      // },
                    },
                    {
                      end_time_hour: {
                        lte: input.end_time.hour,
                      },
                      // end_time_min: {
                      //   lte: input.end_time.minute,
                      // },
                    },
                  ],
                },
              },
            },
          ],
        },

        take: 10,
        skip: (input.page - 1) * 10,

        include: {
          days: true,
          times: true,
        },
      });

      //Returns the guideline result and page number
      return {
        result: courseGuidelinesResult,
        page: input.page,
        totalPages: courseGuidelinesResult.length,
      };
    }),

  //Procedure to add course guideline
  addCourseGuideline: protectedProcedure
    .input(addGuidelineSchema) //Takes input from zod validator
    .mutation(async ({ ctx, input }) => {
      //Query to create a new course guideline
      const guideline = await ctx.prisma.guidelinesCourses.create({
        data: {
          semester_summer: input.semester_summer,
          semester_fall: input.semester_fall,
          semester_winter: input.semester_winter,
          semester_spring: input.semester_spring,
          credits: input.credits,
          meeting_amount: input.meeting_total,
          times: {
            create: [...input.times],
          },
          days: {
            create: [...input.days],
          },
        },
      });
      //Returns if the guideline was successfully added
      return true;
    }),

  deleteCourseGuideline: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //Counts the number of results in the course guidelines table based on the passed tuid
      const hasCourseGuideline = await ctx.prisma.guidelinesCourses.count({
        where: {
          tuid: input.tuid,
        },
      });

      //Checks to see if the course guideline exists and if there is only 1
      if (hasCourseGuideline == 1) {
        //Deletes the entered guideline
        await ctx.prisma.guidelinesCourses.delete({
          //Where the guideline tuid equals the tuid of the requested guideline to be deleted
          where: {
            tuid: input.tuid,
          },
        });

        //Returns if the delete was successful
        return true;
      }
      return false;
    }),

  updateCourseGuideline: protectedProcedure
    .input(updateCourseGuidelineSchema)
    .mutation(async ({ ctx, input }) => {
      //updateCourseGuidelineSchema

      const hasCourseGuideline = await ctx.prisma.guidelinesCourses.count({
        where: {
          tuid: input.tuid,
        },
      });

      if (hasCourseGuideline == 1) {
        //await ctx.prisma.guidelinesCourses.update({});
      }
    }),
});
