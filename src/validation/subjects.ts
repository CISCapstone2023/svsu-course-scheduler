import { z } from "zod";

//this will ensure the user is only inputting one or multiple numbers followed by 0 or 1
//letter followed by 0 or 1 comma or followed by a hyphen and another number(s) followed by 0 or 1 letter

const regex = /[a-zA-Z]+/g;

/**
 * Creates subject schema
 * @author Christian Mallinger
 */
export const createSubjectsSchema = z.object({
  name: z
    .string()
    .regex(regex, {
      message: "Subject name must be an alphabetical and include no whitespace.",
    })
    .min(2, { message: "Subject name must be at least 3 characters" })
    .max(30),
});

export const updateSubjectsSchema = createSubjectsSchema.extend({
  tuid: z.string(),
});


export type ICreateSubjectss = z.infer<typeof createSubjectsSchema>;
export type IUpdateSubjects = z.infer<typeof updateSubjectsSchema>;


