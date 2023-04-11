import { z } from "zod";

/**
 * This regex ensures the user doesn't use any special characters within the name field
 * @author Chris Bellefeuille
 */
const regex = /^[^(#@!$%^&*()<>|{}[\]=+~`"?\/\\:;]+$/;

/**
 * Zod faculty schema that only grabs the faculty member's TUID
 * @author Chris Bellefeuille
 */
export const createFacultySchemaTUID = z.object({
  tuid: z.string(),
});

/**
 * Zod faculty schema that grabs the faculty member's information except for the TUID
 * @author Chris Bellefeuille
 */
export const createFacultySchema = z.object({
  //use all of GuidlelinesFactuly's fields except tuid
  suffix: z.string(),
  name: z
    .string()
    .min(2, { message: "Faculty's name must be at least 2 characters" })
    .max(50, {
      message: "Faculty's name must be no more than 50 characters",
    })
    .regex(regex, "Faculty's name cannot contain unique special characters"),
  email: z
    .string()
    .email({ message: "Faculty's email field must be a valid email address" }),
  is_adjunct: z.boolean(),
  department: z.string(),
});

/**
 * Zod full faculty schema that grabs the faculty member's information with the TUID as well
 * @author Chris Bellefeuille
 */
export const createFacultySchemaWithTUID = createFacultySchema.extend({
  //after extending from the above schema, add tuid to this one
  tuid: z.string(),
});

/**
 * Export the schemas to be used as types within the Faculty router
 * @author Chris Bellefeuille
 */
export type ICreateFaculty = z.infer<typeof createFacultySchema>;
export type IUpdateFaculty = z.infer<typeof createFacultySchemaWithTUID>;
