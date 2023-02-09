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

  meeting_total: z
    .number()
    .min(1)
    .max(4, { message: "Meeting amount must be between 1 and 4." }),

  times: z.array(
    z.object({
      start_time: z.object({
        hour: z.number().min(0).max(24, {
          message: "The hour a course starts must be between 0 and 2400 hours.",
        }),
        minute: z.number().min(0).max(59, {
          message:
            "The minute a course starts must be between 0 and 59 minutes.",
        }),
      }),

      end_time: z.object({
        hour: z.number().min(0).max(24, {
          message: "The hour a course starts must be between 0 and 2400 hours.",
        }),
        minute: z.number().min(0).max(59, {
          message:
            "The minute a course starts must be between 0 and 59 minutes.",
        }),
      }),
    })
  ),

  days: z.object({
    monday: z.boolean().default(false),
    tuesday: z.boolean().default(false),
    wednesday: z.boolean().default(false),
    thursday: z.boolean().default(false),
    friday: z.boolean().default(false),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false),
  }),
});

export type IAddGuideline = z.infer<typeof addGuidelineSchema>;
