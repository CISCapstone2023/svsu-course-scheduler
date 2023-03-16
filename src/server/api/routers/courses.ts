import { z } from "zod";
//import { set } from "date-fns";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { Prisma } from "@prisma/client";
import {
  guidelineCourseAddSchema,
  guidelineCourseUpdateSchema,
} from "src/validation/courses";
import { cssTransition } from "react-toastify";
import militaryToTime from "src/utils/time";

//Imports course guidelines schema with days and times
const courseGuidelinesTD = Prisma.validator<Prisma.GuidelinesCoursesArgs>()({
  include: { times: true, days: true },
});

export type CourseGuidelinesTimeAndDays = Prisma.GuidelinesCoursesGetPayload<
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
        start_time: z.number().min(0).max(23_59).default(30),
        //Defines the min and max hours and minutes for the course guideline end time
        end_time: z.number().min(0).max(23_59).default(22),

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
      const AMOUNT_PER_PAGE = 10;

      let courseGuidelinesResult: CourseGuidelinesTimeAndDays[] = [];
      //Defines the query to find the guidelines based on the selected filters
      const prismaQuery = {
        where: {
          AND: [
            {
              OR: [
                //An OR statement using ternary operators to check if the condition is true.
                input.semester_summer //If true, then the where is set to the input from the user, otherwise do nothing
                  ? {
                      semester_summer: true,
                    }
                  : {},
                input.semester_fall
                  ? {
                      semester_fall: true,
                    }
                  : {},
                input.semester_winter
                  ? {
                      semester_winter: true,
                    }
                  : {},
                input.semester_spring
                  ? {
                      semester_spring: true,
                    }
                  : {},
              ],
            },
            {
              //Queries the guidellines where the credits are less than or equal to the max value
              credits: {
                lte: input.credits.max,
              },
            },
            {
              //Queries the guidelines where the credits are greater than or equal to the min value
              credits: {
                gte: input.credits.min,
              },
            },
            {
              //Queries the guidelines where the number of meetings are less than or equal to the max value
              meeting_amount: {
                lte: input.meeting_total.max,
              },
            },
            {
              //Queries the guidelines where the number of meetings are greater than or equal to the max value
              meeting_amount: {
                gte: input.meeting_total.min,
              },
            },
            {
              days: {
                some: {
                  //Includes some days that will be returned based on the passed input filter
                  OR: [
                    //OR statement to gather all of the guidelines where the guideline days were filtered
                    input.days.monday //Checks to see if this condiiton is true
                      ? {
                          //If true, the input will be passed into the where to select the true days
                          day_monday: {
                            equals: input.days.monday,
                          },
                        }
                      : {}, //Otherwise do nothing
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
                    input.days.friday
                      ? {
                          day_friday: {
                            equals: input.days.friday,
                          },
                        }
                      : {},
                  ],
                },
              },
              times: {
                some: {
                  //Gathers some times for the course guideline
                  AND: [
                    {
                      start_time: {
                        gte: input.start_time, //Grabs the start times that are greater than or equal to the start hour passed in
                      },
                    },
                    {
                      end_time: {
                        lte: input.end_time, //Grabs the end times that are less than or equal to the end hour passed in
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        //Tells the schema to include the days and times relatons
        include: {
          days: true,
          times: true,
        },
      };
      courseGuidelinesResult = await ctx.prisma.guidelinesCourses.findMany({
        ...prismaQuery,
        //Takes 10 results and skips to the next 10
        take: AMOUNT_PER_PAGE,
        skip: (input.page - 1) * AMOUNT_PER_PAGE,
      });

      const differenceInTime = (start_time: number, end_time: number) => {
        const total =
          militaryToTime(end_time).hour * 60 +
          militaryToTime(end_time).minute -
          (militaryToTime(start_time).hour * 60 +
            militaryToTime(start_time).minute);
        const hours = total / 60;
        const rhours = Math.floor(hours);
        const minutes = (hours - rhours) * 60;
        return { hours: rhours, minutes: Math.ceil(minutes) };
      };

      //Returns the guideline result, page number, and the number of pages in the result
      const values = courseGuidelinesResult.map((item) => {
        item.times.map((time) => {
          console.log({ time });
        });
        return {
          ...item,
          times: item.times.map((time) => ({
            tuid: time.tuid,
            //Get the diference in the time
            difference: differenceInTime(time.start_time, time.end_time),
            guideline_id: time.guideline_id,

            //Provide meta data to the client about the time
            start_time_meta: militaryToTime(time.start_time),
            end_time_meta: militaryToTime(time.end_time),

            //Also provide the militrary time too
            start_time: time.start_time,
            end_time: time.end_time,
          })),
        };
      });

      //Total pages based on length of the results divided by AMOUNT_PER_PAGE constant.

      const facultyCount = await ctx.prisma.guidelinesCourses.findMany({
        ...prismaQuery,
      });

      const totalPages = Math.ceil(facultyCount.length / AMOUNT_PER_PAGE);
      console.log({ totalPages, l: courseGuidelinesResult.length });
      return {
        result: values,
        page: input.page,
        totalPages,
      };
    }),

  //Procedure to add course guideline
  addCourseGuideline: protectedProcedure
    .input(guidelineCourseAddSchema) //Takes input from zod validator
    .mutation(async ({ ctx, input }) => {
      //Query to create a new course guideline
      const guideline = await ctx.prisma.guidelinesCourses.create({
        data: {
          semester_summer: input.semester_summer,
          semester_fall: input.semester_fall,
          semester_winter: input.semester_winter,
          semester_spring: input.semester_spring,
          credits: input.credits,
          meeting_amount: input.meeting_amount,
          times: {
            create: [
              ...input.times.map((time) => ({
                tuid: time.tuid,
                guideline_id: time.guideline_id,
                start_time: time.start_time,
                end_time: time.end_time,
              })),
            ],
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
        //Delete all days associated with the one guideline
        await ctx.prisma.guidelinesCoursesDays.deleteMany({
          //Where tuid for the days entry matches that of the deleted guideline
          where: {
            guideline_id: input.tuid,
          },
        }),
          //Delete all times associated with the one guideline
          await ctx.prisma.guidelinesCoursesTimes.deleteMany({
            //Where the tuid for the times entry matches that of the deleted guideline
            where: {
              guideline_id: input.tuid,
            },
          }),
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
      //Else returns false if the delete was not successful
      return false;
    }),

  updateCourseGuideline: protectedProcedure
    .input(guidelineCourseUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      //Checks to see if the guideline exists by searching for the tuid in a count query
      const hasCourseGuideline = await ctx.prisma.guidelinesCourses.count({
        where: {
          tuid: input.tuid,
        },
      });

      if (hasCourseGuideline == 1) {
        //Checks to see if the guideline exists based on the tuid result
        await ctx.prisma.guidelinesCourses.update({
          where: {
            tuid: input.tuid,
          },
          data: {
            //If so, it updates all of the necessary fields based on the input passed
            semester_summer: input.semester_summer,
            semester_fall: input.semester_fall,
            semester_winter: input.semester_winter,
            semester_spring: input.semester_spring,
            credits: input.credits,
            meeting_amount: input.meeting_amount,
          },
        });

        const getTimes = await ctx.prisma.guidelinesCoursesTimes.deleteMany({
          where: {
            guideline_id: input.tuid,
          },
        });

        const getDays = await ctx.prisma.guidelinesCoursesDays.deleteMany({
          where: {
            guideline_id: input.tuid,
          },
        });

        //REFERENCE For attempt... idk
        // await ctx.prisma.guidelinesCourses.update({
        //   where: {
        //     tuid: input.tuid, //Grabs the tuid of the
        //   },
        //   data: {
        //     times: {
        //       disconnect: getTimes.map((time) => {
        //         return { tuid: time.tuid };
        //       }), //Disconnects the guideline based on tuid
        //     },
        //     days: {
        //       disconnect: getTimes.map((days) => {
        //         return { tuid: days.tuid };
        //       }), //Disconnects the guideline based on tuid
        //     },
        //   },
        // });

        //Disconnects the current days and times from the course guideline
        //Currently non-operable. Believe issue with onDelete: Cascade
        // const disconnectDaysTimes = ctx.prisma.guidelinesCourses.update({
        //   where: {
        //     tuid: input.tuid,
        //   }, //Sets the connections equal to an empty array
        //   data: {
        //     times: {
        //       set: [],
        //     },
        //     days: {
        //       set: [],
        //     },
        //   },
        //   include: {
        //     times: true,
        //     days: true,
        //   },
        // });

        //Creates a new map for the time input to be taken from the client
        const times = input.times.map((time) => ({
          where: {
            ...(time.tuid ? { tuid: time.tuid } : { tuid: "" }),
          },
          create: {
            tuid: time.tuid,
            start_time: time.start_time,
            end_time: time.end_time,
          },
        }));

        //Creates a new map for the days input to be taken from the client
        const days = input.days.map((item) => ({
          where: {
            ...(item.tuid ? { tuid: item.tuid } : { tuid: "" }),
          },
          create: {
            day_monday: item.day_monday,
            day_tuesday: item.day_tuesday,
            day_wednesday: item.day_wednesday,
            day_thursday: item.day_thursday,
            day_friday: item.day_friday,
            day_saturday: item.day_saturday,
            day_sunday: item.day_sunday,
          },
        }));

        //Procedure to create a new day or time or connect the day or time to the course guideline

        await ctx.prisma.guidelinesCourses.update({
          where: {
            tuid: input.tuid,
          },
          data: {
            times: {
              connectOrCreate: [...times],
            },
            days: {
              connectOrCreate: [...days],
            },
          },
        });
        return true;
      }
    }),
});
