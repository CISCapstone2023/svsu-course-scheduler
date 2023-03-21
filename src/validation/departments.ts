import { z } from "zod";

//this will ensure the user is only inputting one or multiple numbers followed by 0 or 1
//letter followed by 0 or 1 comma or followed by a hyphen and another number(s) followed by 0 or 1 letter

const regex = /[a-zA-Z]+/g;

/**
 * Creates department schema
 * @author Christian Mallinger
 */
export const createDepartmentsSchema = z.object({
  name: z
    .string()
    .regex(regex, {
      message:
        "Department name must be an alphabetical and include no whitespace.",
    })
    .min(2, { message: "Department name must be at least 3 characters" })
    .max(30),
});

export const updateDepartmentsSchema = createDepartmentsSchema.extend({
  tuid: z.string(),
});

export type ICreateDepartments = z.infer<typeof createDepartmentsSchema>;
export type IUpdateDepartments = z.infer<typeof updateDepartmentsSchema>;
