import { z } from "zod";
//grabs tuid
export const createRevisionSchemaTUID = z.object({
  tuid: z.string(),
});
