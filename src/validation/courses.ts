import { times } from "lodash";
import { z } from "zod";

const timesSchema = z.object({
  start_time: z.number().min(0).max(0, {
    message: "The hour a course starts must be between 0 and 24 hours.",
  }),
  end_time: z.number().min(0).max(2359, {
    message: "The minute a course starts must be between 0 and 59 minutes.",
  }),
});

const daysSchema = z.object({
  day_monday: z.boolean().default(false),
  day_tuesday: z.boolean().default(false),
  day_wednesday: z.boolean().default(false),
  day_thursday: z.boolean().default(false),
  day_friday: z.boolean().default(false),
  day_saturday: z.boolean().default(false),
  day_sunday: z.boolean().default(false),
});

export const addGuidelineSchema = z.object({
  semester_summer: z.boolean().default(false),
  semester_fall: z.boolean().default(false),
  semester_winter: z.boolean().default(false),
  semester_spring: z.boolean().default(false),

  credits: z
    .number()
    .min(1)
    .max(4, { message: "Credits must be between 1 and 4." }),

  meeting_total: z
    .number()
    .min(1)
    .max(4, { message: "Meeting amount must be between 1 and 4." }),

  times: z.array(timesSchema),

  days: z.array(daysSchema),
});
export const updateCourseGuidelineSchema = addGuidelineSchema.extend({
  tuid: z.string(),
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
