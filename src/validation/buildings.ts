import { Regex } from "tabler-icons-react";
import { z } from "zod";

const regex = /^\d+\w?(-\d+\w?)?(,\d+\w?(-\d+\w?)?)*$/;

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
  classrooms: z.string().regex(regex, {
    message:
      "Must contain a single room number like: 143 or a single range like: 20-40 or a list of rooms like: 1,10,30a-40c",
  }),
});

export const updateBuildingSchema = createBuildingSchema.extend({
  tuid: z.string(),
});

export type ICreateCampus = z.infer<typeof createCampusSchema>;
export type IUpdateCampus = z.infer<typeof updateCampusSchema>;

export type ICreateBuilding = z.infer<typeof createBuildingSchema>;
export type IUpdateBuilding = z.infer<typeof updateBuildingSchema>;
