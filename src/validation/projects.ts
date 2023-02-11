import { z } from "zod";

//export const originalStateSchema = z.object({});

export const courseDatabaseSchema = z.object({
  type: z.string(),
  section_id: z.number().int(),
  term: z.number().int(),
  div: z.string(),
  department: z.string(),
  subject: z.string(),
  course_number: z.string(),
  section: z.string(),
  start_date: z.date(),
  end_date: z.date(),
  credits: z.number().int(),
  title: z.string(),
  status: z.string(),
  factory_tuid: z.string(),
  instruction_method: z.string(),
  capacity: z.number().int(),
  location: z.string(),
});

export const organizeColumnRows = z.object({
  tuid: z.string(),
  organizeColumns: z.object({
    section_id: z.number().int(),
    type: z.number().int(),
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
    status: z.number().int(),
    factory_tuid: z.number().int(),
    instruction_method: z.number().int(),
    capacity: z.number().int(),
    location: z.number().int(),
    noteAcademicAffairs: z.number().int(),
    notePrintedComments: z.number().int(),
  }),
});
