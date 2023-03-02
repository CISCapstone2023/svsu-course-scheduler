import { z } from "zod";

//Regex to ensure that the faculty name field can only contain lowercase or uppercase letters
//separated by either a hypen, a single space, or a period and a single space. It will allow up to
//four different names
const facultyNameRegex =
  /^(?:[a-zA-Z]+(-?)([a-zA-Z]*)((\s)|(\.))?(\s)?([a-zA-Z]+(-?)([a-zA-Z]*)((\s)|(\.))?(\s)?)([a-zA-Z]+(-?)([a-zA-Z]*)((\s)|(\.))?(\s)?)([a-zA-Z]+(-?)([a-zA-Z]*)(\.)?))$/;

//zid faculty schema that just grabs the TUID of faculty
export const createFacultySchemaTUID = z.object({
  tuid: z.string(),
});

//zod faculty schema without tuid for reusability in api's
export const createFacultySchema = z.object({
  //use all of GuidlelinesFactuly's fields except tuid
  suffix: z.string(),
  name: z
    .string()
    .min(2, { message: "Faculty's name must be at least 2 characters" })
    .max(50, {
      message: "Faculty's name must be no more than 50 characters",
    }),
  // .regex(facultyNameRegex, {
  //   message:
  //     "Faculty's name must contain only alphabetical characters optionally separated by a space or hyphen",
  // }),
  // first_name: z
  //   .string()
  //   .min(2, { message: "Faculty's first name must be at least 2 characters" })
  //   .max(30, {
  //     message: "Faculty's first name must be no more than 30 characters",
  //   }),
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
