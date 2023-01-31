import { z } from "zod";

export const createFacultySchemaNoTUID = z.object({
  suffix: z.string(),
  last_name: z.string(),
  first_name: z.string(),
  email: z.string(),
  is_adjunct: z.boolean(),
});

export const createFacultySchemaWithTUID = createFacultySchemaNoTUID.extend({
  tuid: z.string(),
});
