import { z } from "zod";

const timesSchema = z.object({
  start_time: z.number().min(0).max(2200, {
    message: "The hour a course starts must be between 0 and 24 hours.",
  }),
  end_time: z.number().min(0).max(2359, {
    message: "The minute a course starts must be between 0 and 59 minutes.",
  }),
});

const timesSchemaExtended = z
  .object({
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
  })
  .superRefine(async (val, ctx) => {
    if (
      val.start_time.hour * 60 + val.start_time.minute >
      val.end_time.hour * 60 + val.end_time.minute
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_time", "hour"],
        message: `End time can occur before start time!`,
      });
    }
  });

const daysSchema = z
  .object({
    guideline_id: z.string().optional(),
    tuid: z.string().optional(),
    day_monday: z.boolean().default(false),
    day_tuesday: z.boolean().default(false),
    day_wednesday: z.boolean().default(false),
    day_thursday: z.boolean().default(false),
    day_friday: z.boolean().default(false),
    day_saturday: z.boolean().default(false),
    day_sunday: z.boolean().default(false),
  })
  .superRefine((val, ctx) => {
    const hasDay =
      val.day_monday ||
      val.day_tuesday ||
      val.day_wednesday ||
      val.day_thursday ||
      val.day_friday ||
      val.day_saturday ||
      val.day_sunday;
    if (hasDay == false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tuid"],
        message: "Select at least one day.",
      });
    }
  });

/**
 * Course Guideline Validation & Schemas
 */
export const guidelineCourseAddSchemaBase = z.object({
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

  times: z
    .array(timesSchemaExtended)
    .min(1, { message: "At least one time is required." }),

  days: z
    .array(daysSchema)
    .min(1, { message: "At least one day block is required." }),
});

export const guidelineCourseAddSchema =
  guidelineCourseAddSchemaBase.superRefine((val, ctx) => {
    const hasSemester =
      val.semester_fall ||
      val.semester_summer ||
      val.semester_spring ||
      val.semester_winter;
    if (hasSemester == false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tuid"],
        message: "Select at least one semester.",
      });
    }
  });

export const guidelineCourseUpdateSchema = guidelineCourseAddSchemaBase
  .extend({
    tuid: z.string().optional(),
    days: z.array(daysSchema),
    times: z.array(timesSchemaExtended),
  })
  .superRefine((val, ctx) => {
    const hasSemester =
      val.semester_fall ||
      val.semester_summer ||
      val.semester_spring ||
      val.semester_winter;
    if (hasSemester == false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tuid"],
        message: "Select at least one semester.",
      });
    }
  });

export type IGuidelineCourseAdd = z.infer<typeof guidelineCourseAddSchema>;
export type IGuidelineCourseUpdate = z.infer<
  typeof guidelineCourseUpdateSchema
>;
