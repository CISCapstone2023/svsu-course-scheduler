import { z } from "zod";

/**
 * This regex ensures the user only enters alphabetical characters with no whitespaces
 * @author Chris Bellefeuille
 */
const regex = /^[a-zA-Z]+$/;

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

/**
 * Create the department schema that includes the TUID
 * @author Christian Mallinger
 */
export const updateDepartmentsSchema = createDepartmentsSchema.extend({
  tuid: z.string(),
});

export type ICreateDepartments = z.infer<typeof createDepartmentsSchema>;
export type IUpdateDepartments = z.infer<typeof updateDepartmentsSchema>;
