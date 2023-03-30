import { signUpSchema } from "src/validation/auth";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import { z } from "zod";

export const dashboardRouter = createTRPCRouter({
  getRevisionName: protectedProcedure
    .input(
      z.object({
        revision_tuid: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      //Query the revision from the tuid
      const revision = await ctx.prisma.scheduleRevision.findFirst({
        where: { tuid: input.revision_tuid },
      });

      //Make sure the revision is not null
      if (revision != null) {
        return {
          name: revision.name,
        };
      } else {
        return {
          name: "<Untitled>",
        };
      }
    }),
});
