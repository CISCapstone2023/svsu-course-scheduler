import { signUpSchema } from "src/validation/auth";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { hash } from "bcrypt";

export const routerAuth = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      const { username, email, password } = input;

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
        data: { username, email, password: hashedPassword },
      });

      return {
        status: 201,
        message: "Account created successfully",
        result: result.email,
      };
    }),
});
