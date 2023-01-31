import { z } from "zod";

export const createCampusSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Campus name must be at least 3 characters" })
    .max(30),
});

export const updateCampusSchema = createCampusSchema.extend({
  tuid: z.string(),
});

export type ICreateCampus = z.infer<typeof createCampusSchema>;
export type IUpdateCampus = z.infer<typeof updateCampusSchema>;
