import { z } from "zod";

export const addGuidelineSchema = z.object({
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

  times: z.array(
    z.object({
      start_time_hour: z.number().min(0).max(24, {
        message: "The hour a course starts must be between 0 and 2400 hours.",
      }),
      start_time_min: z.number().min(0).max(59, {
        message: "The minute a course starts must be between 0 and 59 minutes.",
      }),

      end_time_hour: z.number().min(0).max(24, {
        message: "The hour a course starts must be between 0 and 2400 hours.",
      }),
      end_time_min: z.number().min(0).max(59, {
        message: "The minute a course starts must be between 0 and 59 minutes.",
      }),
    })
  ),

  days: z.array(
    z.object({
      day_monday: z.boolean().default(false),
      day_tuesday: z.boolean().default(false),
      day_wednesday: z.boolean().default(false),
      day_thursday: z.boolean().default(false),
      day_friday: z.boolean().default(false),
      day_saturday: z.boolean().default(false),
      day_sunday: z.boolean().default(false),
    })
  ),
});

export type IAddGuideline = z.infer<typeof addGuidelineSchema>;
