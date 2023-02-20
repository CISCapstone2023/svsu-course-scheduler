import { CourseNoteType, CourseState } from "@prisma/client";
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

export const addNewRevisionCourse = z.object({
  tuid: z.string().optional(),
});

const facultyToCourseSchema = z.object({
  tuid: z.string().optional(),
  faculty_tuid: z.string(),
  course_tuid: z.string(),
});

const revisionSchema = z.object({
  tuid: z.string(),
  name: z.string(),
  schedule_tuid: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  onboarding: z.boolean(),
  creator_tuid: z.string(),
});

const notesSchema = z.object({
  tuid: z.string().optional(),
  note: z.string(),
  type: z.nativeEnum(CourseNoteType),
  course_tuid: z.string(),
});

const locationsSchema = z.object({
  tuid: z.string().optional(),
  start_time: z.number(),
  end_time: z.number(),
  day_monday: z.boolean(),
  day_tuesday: z.boolean(),
  day_wednesday: z.boolean(),
  day_thursday: z.boolean(),
  day_friday: z.boolean(),
  day_saturday: z.boolean(),
  day_sunday: z.boolean(),
  is_online: z.boolean(),
  course_tuid: z.string(),
});

const courseSchema = z.object({
  tuid: z.string().optional(),
  type: z.string(),
  section_id: z.number().min(1).default(1),
  revision_tuid: z.string(),
  term: z.number(),
  semester_summer: z.boolean().default(false),
  semester_fall: z.boolean().default(false),
  semester_winter: z.boolean().default(false),
  semester_spring: z.boolean().default(false),
  div: z.string(),
  department: z.string(),
  subject: z.string(),
  course_number: z.string(),
  section: z.number(),
  start_date: z.date(),
  end_date: z.date(),
  start_time: z.number().min(0).max(2200, {
    message: "The hour a course starts must be between 0 and 24 hours.",
  }),
  end_time: z.number().min(0).max(2359, {
    message: "The minute a course starts must be between 0 and 59 minutes.",
  }),
  credits: z.number(),
  title: z.string(),
  status: z.string().default("Active"),
  faculty_tuid: z.string(),
  instruction_method: z.string().default("LEC"),
  capacity: z.number(),
  original_state: z.nativeEnum(CourseState),
  state: z.nativeEnum(CourseState),
  location: z.string(),
  createdAt: z.date(),
  updateAt: z.date(),
  faculty: z.array(facultyToCourseSchema),
  revision: revisionSchema,
  notes: z.array(notesSchema),
  locations: z.array(locationsSchema),
});

export type IAddGuidelineCourse = z.infer<typeof addGuidelineSchema>;
export type IUpdateGuidelineCourse = z.infer<
  typeof updateCourseGuidelineSchema
>;
