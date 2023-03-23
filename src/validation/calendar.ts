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
  room: z.string().nullable(),
  building: z
    .object({
      buiding_tuid: z.string().cuid().nullable(),
    })
    .nullable(),
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
  rooms: roomsSchema.optional().default({
    building: {
      buiding_tuid: null,
    },
    room: null,
  }),
});

//Provides the two digit year
const twoDigitYear = parseInt(
  new Date().getFullYear().toString().substr(2, 2),
  10
);

/**
 * Enum for the four semesters used in calendar front end and back end as well
 * as validation
 * @author Chris Bellefeuille
 */
export enum Semesters {
  FALL = "Fall",
  WINTER = "Winter",
  SPRING = "Spring",
  SUMMER = "Summer",
}

/**
 * Calendar Add Course Schema & Validation
 */
export const calendarCourseSchema = z
  .object({
    section_id: z.number().optional().nullable(),
    tuid: z.string().optional(),
    type: z.string().optional().default("?"),
    term: z
      .number()
      .min(0)
      .max(twoDigitYear + 2),
    semester: z
      .nativeEnum(Semesters, {
        errorMap: (issue, ctx) => {
          return { message: "Select a semester" };
        },
      })
      .default(Semesters.FALL),
    div: z.string().optional().default("SC"),
    department: z
      .string()
      .min(2)
      .max(6, { message: "Department type is larger than expected." }),
    subject: z
      .string()
      .min(2)
      .max(6, { message: "Subject type is larger than expected." }),
    course_number: z.string(),
    section: z.string(),
    start_date: z.date(),
    end_date: z.date(),
    credits: z.number(),
    title: z.string().max(100).optional().default(""),
    status: z.string().default("Active"),
    instruction_method: z.string().default("LEC"),
    capacity: z
      .number()
      .min(1)
      .max(500, {
        message: "Capacity has a limit of 500 students on a course.",
      })
      .default(30),
    original_state: z.nativeEnum(CourseState).default("UNMODIFIED"),
    state: z.nativeEnum(CourseState).default("UNMODIFIED"),

    //Get a single faculty member on a course
    faculty: facultyToCourseSchema,
    //Force set the notes type here
    notes: z.object({
      ACAMDEMIC_AFFAIRS: z.string(),
      DEPARTMENT: z.string(),
      CHANGES: z.string(),
    }),
    locations: z.array(locationsSchema),
  })
  .superRefine(async (val, ctx) => {
    if (val.start_date > val.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "Start date cannot be later than end year.",
      });
    }
  });

export const calendarAddNewCourseToRevisionSchema = z.object({
  tuid: z.string().optional(),
  course: calendarCourseSchema,
});

//Export type for Calendar Course Schema
export type ICalendarCourseSchema = z.infer<typeof calendarCourseSchema>;
