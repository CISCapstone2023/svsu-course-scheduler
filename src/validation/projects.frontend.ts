import { z } from "zod";

export const finalizeProjectOnBoarding = z.object({
  name: z
    .string()
    .regex(/^[^\s\\\/\?\*\[\]]+$/, {
      message: "Project name cannot contain  / ? * [ ]",
    })
    .min(5, { message: "Enter a name at least 5 characters long" }),
});

export type IProjectFinalizeOnboarding = z.infer<
  typeof finalizeProjectOnBoarding
>;

export const organizeColumns = z.object({
  section_id: z.number().int(),
  noteWhatHasChanged: z.number().int(),
  term: z.number().int(),
  div: z.number().int(),
  department: z.number().int(),
  subject: z.number().int(),
  course_number: z.number().int(),
  section: z.number().int(),
  start_date: z.number().int(),
  end_date: z.number().int(),
  //...BELOW 2 NOT USED
  start_time: z.number().int(),
  end_time: z.number().int(),
  //END
  credits: z.number().int(),
  title: z.number().int(),
  building: z.number().int(),
  faculty: z.number().int(),
  instruction_method: z.number().int(),
  capacity: z.number().int(),
  campus: z.number().int(),
  room: z.number().int(),
  noteAcademicAffairs: z.number().int(),
  notePrintedComments: z.number().int(),
  days: z.number().int(),
  course_method: z.number().int(),
  course_start_date: z.number().int(),
  course_end_date: z.number().int(),
});

const unionStringNumber = z.string();

export const organizeColumnsString = z.object({
  section_id: unionStringNumber,
  noteWhatHasChanged: unionStringNumber,
  term: unionStringNumber,
  div: unionStringNumber,
  department: unionStringNumber,
  subject: unionStringNumber,
  course_number: unionStringNumber,
  section: unionStringNumber,
  start_date: unionStringNumber,
  end_date: unionStringNumber,
  start_time: unionStringNumber,
  end_time: unionStringNumber,
  credits: unionStringNumber,
  title: unionStringNumber,
  building: unionStringNumber,
  faculty: unionStringNumber,
  instruction_method: unionStringNumber,
  capacity: unionStringNumber,
  campus: unionStringNumber,
  room: unionStringNumber,
  noteAcademicAffairs: unionStringNumber,
  notePrintedComments: unionStringNumber,
  days: unionStringNumber,
  course_method: unionStringNumber,
  course_start_date: unionStringNumber,
  course_end_date: unionStringNumber,
});
export type IProjectOrganizedColumnRowNumerical = z.infer<
  typeof organizeColumns
>;
