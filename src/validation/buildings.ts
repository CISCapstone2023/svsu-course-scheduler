import { z } from "zod";

export const createCampusSchema = z.object({
  name: z.string().min(4).max(30),
});

export const createBuildingSchema = z.object({
  name: z.string().min(4).max(75),
  prefix: z.string().min(1).max(4),
});

export type ICreateCampus = z.infer<typeof createCampusSchema>;
export type ICreateBuilding = z.infer<typeof createBuildingSchema>;
