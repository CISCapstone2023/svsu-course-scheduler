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
  campus_tuid: z.string(),
  name: z
    .string()
    .min(4, { message: "Building name must be at least 4 characters" })
    .max(75, { message: "Building name must be no more than 75 characters" }),
  prefix: z
    .string()
    .min(1, { message: "Building prefix must be at least 1 character" })
    .max(4, { message: "Building prefix must be no more than 4 characters" }),
  classrooms: z.string(),
});

export const updateBuildingSchema = createBuildingSchema.extend({
  tuid: z.string(),
});

export type ICreateCampus = z.infer<typeof createCampusSchema>;
export type IUpdateCampus = z.infer<typeof updateCampusSchema>;

export type ICreateBuilding = z.infer<typeof createBuildingSchema>;
export type IUpdateBuilding = z.infer<typeof updateBuildingSchema>;
