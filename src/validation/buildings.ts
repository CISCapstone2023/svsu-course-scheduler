import { z } from "zod";

//this will ensure the user is only inputting one or multiple numbers followed by 0 or 1
//letter followed by 0 or 1 comma or followed by a hyphen and another number(s) followed by 0 or 1 letter
const regex = /^\d+\w?(-\d+\w?)?(,\d+\w?(-\d+\w?)?)*$/;
const campusRegex = /[a-zA-Z]+/g;
const buildingRegex = /^[\a-zA-Z[\-\s]+$/;

export const createCampusSchema = z.object({
  name: z
    .string()
    .regex(campusRegex, {
      message: "Campus name must be an alphabetical and include no whitespace.",
    })
    .min(2, { message: "Campus name must be at least 3 characters" })
    .max(30),
});

export const updateCampusSchema = createCampusSchema.extend({
  tuid: z.string(),
});

//Regex to validate building name and allows upper case, lower case, numbers, dashes, and a period
const buildingRegex = /[a-zA-Z0-9-]+/i;

export const createBuildingSchema = z.object({
  campus_tuid: z.string().cuid({ message: "A valid campus must be selected." }),
  name: z
    .string()
    .regex(buildingRegex, {
        "Building name must be alphanumeric and can include a dash or period.",
    })
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
