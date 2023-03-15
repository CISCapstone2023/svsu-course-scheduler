import { CourseNoteType, CourseState } from "@prisma/client";
import { object, z } from "zod";
import { prisma } from "src/server/db";
import { organizeColumns, organizeColumnsString } from "./projects.frontend";
export const courseDefined = z.object({
  type: z.string(),
  section_id: z.string(),
  term: z.string(),
  div: z.string(),
  department: z.string(),
  subject: z.string(),
  course_number: z.string(),
  section: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  start_time: z.number(),
  end_time: z.number(),
  capacity: z.number(),
  credits: z.number(),
  title: z.string(),
  building: z.string(),
  faculty: z.string(),
  instruction_method: z.string(),
  campus: z.string(),
  days: z.string(),
});

export const organizeColumnRows = z.object({
  tuid: z.string(),
  columns: organizeColumns,
});

export const createRevisionOnboarding = organizeColumnRows.extend({
  name: z.string(),
  schedule: z.string().nullable(),
});

export type IProjectCreateRevision = z.infer<typeof createRevisionOnboarding>;

export type IProjectOrganizedColumnFromClient = z.infer<
  typeof organizeColumnRows
>;
export type IProjectOrganizedColumnRow = z.infer<typeof organizeColumnsString>;

export const createRevisionSchemaTUID = z.object({
  tuid: z.string(),
});

/**
 * Excel Course Validaition & Schema
 */

const facultyToCourseSchema = z.object({
  faculty_tuid: z.string().superRefine(async (val, ctx) => {
    console.log("PARSING HERE");
    const amount = await prisma.guidelinesFaculty.count({
      where: {
        tuid: val,
      },
    });
    if (amount == 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 3,
        type: "array",
        inclusive: true,
        message: `Faculty member '${val}' does not exist!`,
      });
    }
  }),
  course_tuid: z.string().optional(),
});

const notesSchema = z.object({
  tuid: z.string().optional(),
  note: z.string().optional(),
  type: z.nativeEnum(CourseNoteType),
});

const roomsSchema = z.object({
  room: z.string(),
  building_tuid: z.string().superRefine(async (val, ctx) => {
    const amount = await prisma.guidelineBuilding.count({
      where: {
        tuid: val,
      },
    });
    if (amount == 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        fatal: false,
        message: `Building '${val}' does not exist!`,
      });
    }
  }),
});

const locationsSchema = z.object({
  start_time: z.number({
    errorMap: (issue, ctx) => {
      return { message: "A course is missing a valid start time" };
    },
  }),
  end_time: z.number({
    errorMap: (issue, ctx) => {
      return { message: "A course is missing a valid end time" };
    },
  }),
  day_monday: z.boolean().default(false),
  day_tuesday: z.boolean().default(false),
  day_wednesday: z.boolean().default(false),
  day_thursday: z.boolean().default(false),
  day_friday: z.boolean().default(false),
  day_saturday: z.boolean().default(false),
  day_sunday: z.boolean().default(false),
  is_online: z.boolean().default(false),
  rooms: z.array(roomsSchema),
});

//Provides the two digit year
const twoDigitYear = parseInt(
  new Date().getFullYear().toString().substr(2, 2),
  10
);

export const excelCourseSchema = z
  .object({
    tuid: z.string().optional(),
    type: z.string(),
    section_id: z.number().min(1).nullable(),
    revision_tuid: z.string().optional(),
    term: z
      .number()
      .min(twoDigitYear - 2)
      .max(twoDigitYear + 2),
    semester_summer: z.boolean().default(false),
    semester_fall: z.boolean().default(false),
    semester_winter: z.boolean().default(false),
    semester_spring: z.boolean().default(false),
    div: z.string(),
    department: z
      .string()
      .min(2)
      .max(6, { message: "Department type is larger than expected." }),
    subject: z
      .string()
      .min(2)
      .max(6, { message: "Subject type is larger than expected." }),
    course_number: z.string(),
    section: z.number().min(0).max(500),
    start_date: z.date(),
    end_date: z.date(),
    // start_time: z.number().min(0).max(2200, {
    //   message: "The hour a course starts must be between 0 and 24 hours.",
    // }),
    // end_time: z.number().min(0).max(2359, {
    //   message: "The minute a course starts must be between 0 and 59 minutes.",
    // }),
    credits: z.number(),
    title: z.string().min(7).max(100),
    status: z.string().default("Active"),
    //faculty_tuid: z.string(),
    instruction_method: z.string().default("LEC"),
    capacity: z.number().min(1).max(500, {
      message: "Capacity has a limit of 500 students on a course.",
    }),
    original_state: z.nativeEnum(CourseState).default("UNMODIFIED"),
    state: z.nativeEnum(CourseState).default("UNMODIFIED"),
    faculty: z.array(facultyToCourseSchema).min(1, {
      message: "A faculty member must be present on a course.",
    }),
    notes: z.array(notesSchema).min(3),
    locations: z.array(locationsSchema),
  })
  .partial()
  .refine(
    ({ semester_fall, semester_winter, semester_spring, semester_summer }) =>
      !(
        semester_fall == false &&
        semester_winter == false &&
        semester_spring == false &&
        semester_summer == false
      ),
    { message: "A course must have a selected semester defined from the term" }
  );
export type IProjectsExcelCourseSchema = z.infer<typeof excelCourseSchema>;
