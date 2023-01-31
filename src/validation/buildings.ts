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

export const createBuildingSchema = z.object({
  name: z.string().min(4).max(75),
  prefix: z.string().min(1).max(4),
  classrooms: z.string(),
});

export const updateBuildingSchema = createBuildingSchema.extend({
  tuid: z.string(),
});

export type ICreateCampus = z.infer<typeof createCampusSchema>;
export type IUpdateCampus = z.infer<typeof updateCampusSchema>;

export type ICreateBuilding = z.infer<typeof createBuildingSchema>;
export type IUpdateBuilding = z.infer<typeof updateBuildingSchema>;