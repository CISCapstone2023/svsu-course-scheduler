import { times } from "lodash";
import { z } from "zod";

const timesSchema = z.object({
  start_time: z.number().min(0).max(2200, {
    message: "The hour a course starts must be between 0 and 24 hours.",
  }),
  end_time: z.number().min(0).max(2359, {
    message: "The minute a course starts must be between 0 and 59 minutes.",
  }),
});

const timesSchemaExtended = z.object({
  guideline_id: z.string().optional(),
  tuid: z.string().optional(),
  start_time: z.object({
    hour: z.number().min(0).max(23, {
      message: "The hour a course starts must be between 0 and 24 hours.",
    }),
    minute: z.number().min(0).max(59, {
      message: "The minute a course starts must be between 0 and 59 minutes.",
    }),
    anteMeridiem: z.string(),
    anteMeridiemHour: z.number().min(0).max(12, {
      message: "The hour a course starts must be between 0 and 12 hours.",
    }),
  }),

  end_time: z.object({
    hour: z.number().min(0).max(23, {
      message: "The hour a course starts must be between 0 and 24 hours.",
    }),
    minute: z.number().min(0).max(59, {
      message: "The minute a course starts must be between 0 and 59 minutes.",
    }),
    anteMeridiem: z.string(),
    anteMeridiemHour: z.number().min(0).max(12, {
      message: "The hour a course starts must be between 0 and 12 hours.",
    }),
  }),
});

const daysSchema = z.object({
  guideline_id: z.string().optional(),
  tuid: z.string().optional(),
  day_monday: z.boolean().default(false),
  day_tuesday: z.boolean().default(false),
  day_wednesday: z.boolean().default(false),
  day_thursday: z.boolean().default(false),
  day_friday: z.boolean().default(false),
  day_saturday: z.boolean().default(false),
  day_sunday: z.boolean().default(false),
});

export const addGuidelineSchema = z.object({
  tuid: z.string().optional(),
  semester_summer: z.boolean().default(false),
  semester_fall: z.boolean().default(false),
  semester_winter: z.boolean().default(false),
  semester_spring: z.boolean().default(false),

  credits: z
    .number()
    .min(1)
    .max(4, { message: "Credits must be between 1 and 4." }),

  meeting_amount: z
    .number()
    .min(1)
    .max(4, { message: "Meeting amount must be between 1 and 4." }),

  times: z.array(timesSchemaExtended),

  days: z.array(daysSchema),
});

export const updateCourseGuidelineSchema = addGuidelineSchema.extend({
  tuid: z.string().optional(),
  days: z.array(
    daysSchema.extend({
      tuid: z.string(),
    })
  ),
  times: z.array(
    timesSchema.extend({
      tuid: z.string(),
    })
  ),
});

export type IAddGuidelineCourse = z.infer<typeof addGuidelineSchema>;
export type IUpdateGuidelineCourse = z.infer<
  typeof updateCourseGuidelineSchema
>;
