import { z } from "zod";

//Regex to ensure that the faculty name field can only contain lowercase or uppercase letters
//separated by either a hypen or a single space
const facultyNameRegex = /^[a-zA-Z[\-\s]+$/;

//zid faculty schema that just grabs the TUID of faculty
export const createFacultySchemaTUID = z.object({
  tuid: z.string(),
});

//zod faculty schema without tuid for reusability in api's
export const createFacultySchema = z.object({
  //use all of GuidlelinesFactuly's fields except tuid
  suffix: z.string(),
  last_name: z
    .string()
    .min(2, { message: "Faculty's last name must be at least 2 characters" })
    .max(30, {
      message: "Faculty's first name must be no more than 30 characters",
    }),
  first_name: z
    .string()
    .min(2, { message: "Faculty's first name must be at least 2 characters" })
    .max(30, {
      message: "Faculty's first name must be no more than 30 characters",
    }),
  email: z
    .string()
    .email({ message: "Faculty's email field must be a valid email address" }),
  is_adjunct: z.boolean(),
});

//zod faculty schema with tuid added for reusability in api's
export const createFacultySchemaWithTUID = createFacultySchema.extend({
  //after extending from the above schema, add tuid to this one
  tuid: z.string(),
});

export type ICreateFaculty = z.infer<typeof createFacultySchema>;
export type IUpdateFaculty = z.infer<typeof createFacultySchemaWithTUID>;
