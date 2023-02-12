import { z } from "zod";

//export const originalStateSchema = z.object({});

export const courseDatabaseSchema = z.object({
  type: z.string().optional(),
  section_id: z.string().optional(),
  term: z.string().optional(),
  div: z.string().optional(),
  department: z.string().optional(),
  subject: z.string().optional(),
  course_number: z.string().optional(),
  section: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  capacity: z.string().optional(),
  credits: z.string().optional(),
  title: z.string().optional(),
  building: z.string().optional(),
  faculty: z.string().optional(),
  instruction_method: z.string().optional(),
  campus: z.string().optional(),
  days: z.string().optional(),
});

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
  start_time: z.number().int(),
  end_time: z.number().int(),
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
});

export const organizeColumnRows = z.object({
  tuid: z.string(),
  organizeColumns: organizeColumns,
});

export type IProjectOrganizedColumnFromClient = z.infer<
  typeof organizeColumnRows
>;
export type IProjectOrganizedColumnRow = z.infer<typeof organizeColumnsString>;
