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
  room: z.string().nullable().optional(),
  building: z
    .object({
      buiding_tuid: z.string().cuid().nullable(),
    })
    .optional()
    .nullable(),
});

/**
 * Locations
 */
const locationsSchema = z
  .object({
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
  })
  .superRefine(async (val, ctx) => {
    if (
      val.day_monday ||
      val.day_tuesday ||
      val.day_wednesday ||
      val.day_thursday ||
      val.day_friday ||
      val.day_saturday ||
      val.day_sunday
    ) {
      //If the time is less than 7 am, than warn
      if (val.start_time < 700) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_time"],
          message: "Start time should be after 7:00 AM.",
        });

        //if the start time is before the end time
      } else if (val.end_time < val.start_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_time"],
          message: "End time should not occur before start time.",
        });
        //if the end time is passed 11 pm
      } else if (val.end_time > 2300) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_time"],
          message: "End time should be no later than 11:00 PM.",
        });
      }
    } else {
      //If we have no days and are not online, for the user to add at least 1 day
      if (val.is_online == false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["day_monday"],
          message: "If a course is in person, select day(s).",
        });
      }
    }
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
//Regex here for course_number: 3 numbers followed by, optional letter, followed by optional symbol
const courseIdRegex = /^\d{3}\w?[!]?$/g;

export const calendarCourseSchema = z
  .object({
    section_id: z.number().optional().nullable(),
    tuid: z.string().optional(),
    type: z.string().optional().default("?"),
    term: z
      .number()
      .min(0, { message: "Term must be bigger than 0." })
      .max(99, { message: "Term must be less than 99" }),
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
      .min(2, { message: "Department should be at least 2 characters" })
      .max(6, { message: "Department can't be more than 6 characters" }),
    subject: z
      .string()
      .min(2, { message: "Subject should be at least 2 characters" })
      .max(6, { message: "Subject can't be more than 6 characters" }),
    course_number: z.string().regex(courseIdRegex, {
      message:
        "Course must be 3 numbers, ending in an optional letter and/or optional '!'",
    }),
    section: z.string(),
    start_date: z.date(),
    end_date: z.date(),
    credits: z.number(),
    title: z
      .string()
      .max(100, { message: "The title can not be more than 100 characters." })
      .optional()
      .default(""),
    status: z.string().default("Active"),
    instruction_method: z.string().default("LEC"),
    capacity: z
      .number()
      .min(1, {
        message: "Capacity for a course should be at least 1 student.",
      })
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
    locations: z
      .array(locationsSchema)
      .min(1, { message: "A course must have at least 1 time & location" }),
  })
  .superRefine(async (val, ctx) => {
    //Check if the start date is passed the end date.
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
