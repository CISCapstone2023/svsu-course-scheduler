import { z } from "zod";

//This regex ensures the user only enters alphabetical characters with no whitespaces
const regex = /^[a-zA-Z]+$/;

/**
 * Creates subject schema
 * @author Christian Mallinger
 */
export const createSubjectsSchema = z.object({
  name: z
    .string()
    .regex(regex, {
      message:
        "Subject name must be an alphabetical and include no whitespace.",
    })
    .min(2, { message: "Subject name must be at least 3 characters" })
    .max(30),
});

export const updateSubjectsSchema = createSubjectsSchema.extend({
  tuid: z.string(),
});

export type ICreateSubject = z.infer<typeof createSubjectsSchema>;
export type IUpdateSubject = z.infer<typeof updateSubjectsSchema>;
