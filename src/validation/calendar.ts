import { CourseState } from "@prisma/client";
import { z } from "zod";

/**
 * Faculty
 */
const facultyToCourseSchema = z.object({
  faculty_tuid: z.string().cuid(),
  course_tuid: z.string().optional(),
});

/**
 * Rooms
 */
const roomsSchema = z.object({
  room: z.string(),
  building_tuid: z.string().cuid(),
});

/**
 * Locations
 */
const locationsSchema = z.object({
  start_time: z.number(),
  end_time: z.number(),
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

/**
 * Calendar Add Course Schema & Validation
 */
export const calendarCourseSchema = z
  .object({
    tuid: z.string().optional(),
    type: z.string(),
    section_id: z.number().min(1).nullable(),
    revision_tuid: z.string().optional(),
    term: z
      .number()
      .min(0)
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
    credits: z.number(),
    title: z.string().min(7).max(100),
    status: z.string().default("Active"),
    instruction_method: z.string().default("LEC"),
    capacity: z.number().min(1).max(500, {
      message: "Capacity has a limit of 500 students on a course.",
    }),
    original_state: z.nativeEnum(CourseState).default("UNMODIFIED"),
    state: z.nativeEnum(CourseState).default("UNMODIFIED"),
    faculty: z.array(facultyToCourseSchema).min(1, {
      message: "A faculty member must be present on a course.",
    }),
    //Force set the notes type here
    notes: z.object({
      ACAMDEMIC_AFFAIRS: z.string(),
      DEPARTMENT: z.string(),
      CHANGES: z.string(),
    }),
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
    { message: "A course must have a selected semester." }
  );

export const calendarAddNewCourseToRevisionSchema = z.object({
  tuid: z.string().optional(),
  course: calendarCourseSchema,
});

//Export type for Calendar Course Schema
export type ICalendarCourseSchema = z.infer<typeof calendarCourseSchema>;
