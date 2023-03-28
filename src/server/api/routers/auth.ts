import { signUpSchema } from "src/validation/auth";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import { hash } from "bcrypt";

export const routerAuth = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      const { username, email, password, department } = input;

      const exists = await ctx.prisma.user.findFirst({
        where: { email },
      });

      if (exists) {
        return {
          status: 409,
          message: "Email already in use",
          error: true,
        };
      }

      const hashedPassword = await hash(password, 10);

      const result = await ctx.prisma.user.create({
        data: { username, email, department, password: hashedPassword },
      });

      return {
        status: 201,
        message: "Account created successfully",
        result: result.email,
      };
    }),

  getUser: protectedProcedure.query(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        name: true,
        department: true,
        email: true,
      },
    });

    if (user) {
      return user;
    }
    return null;
  }),
});
