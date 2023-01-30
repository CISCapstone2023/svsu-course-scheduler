import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "src/server/api/trpc";

export const facultyRouter = createTRPCRouter({
  addFaculty: publicProcedure
    .input(
      z.object({
        suffix: z.string(),
        last_name: z.string(),
        first_name: z.string(),
        email: z.string(),
        is_adjunct: z.boolean(),
      })
    )
    .query(async ({ ctx, input }) => {
      await ctx.prisma.guidelinesFaculty.create({
        data: {
          suffix: input.suffix,
          last_name: input.last_name,
          first_name: input.first_name,
          email: input.email,
          is_adjunct: input.is_adjunct,
        },
      });
      return {
        status: "placeholder",
      };
    }),

  deleteOneFaculty: publicProcedure
    .input(
      z.object({
        suffix: z.string(),
        last_name: z.string(),
        first_name: z.string(),
        email: z.string(),
        is_adjunct: z.boolean(),
      })
    )
    .query(async ({ ctx, input }) => {
      await ctx.prisma.guidelinesFaculty.delete({
        where: {
          // last_name:
          //ask Brendan about this issue
        },
      });
      return {
        status: "placeholder",
      };
    }),

  getAllFaculty: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.guidelinesFaculty.findMany();
    return data;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
