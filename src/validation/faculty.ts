import { z } from "zod";

//zid faculty schema that just grabs the TUID of faculty
export const createFacultySchemaTUID = z.object({
  tuid: z.string(),
});

//zod faculty schema without tuid for reusability in api's
export const createFacultySchemaNoTUID = z.object({
  //use all of GuidlelinesFactuly's fields except tuid
  suffix: z.string(),
  last_name: z.string(),
  first_name: z.string(),
  email: z.string(),
  is_adjunct: z.boolean(),
});

//zod faculty schema with tuid added for reusability in api's
export const createFacultySchemaWithTUID = createFacultySchemaNoTUID.extend({
  //after extending from the above schema, add tuid to this one
  tuid: z.string(),
});
