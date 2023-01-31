import { z } from "zod";

export const createCampusSchema = z.object({
  name: z.string().min(4).max(30),
});

export type ICreateCampus = z.infer<typeof createCampusSchema>;
