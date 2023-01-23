import { signUpSchema } from "src/validation/auth";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { hash } from "bcrypt";

export const routerAuth = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      const { username, email, password } = input;
      console.log("Find the user?");
      const exists = await ctx.prisma.user.findFirst({
        where: { email },
      });
      console.log("Did we get here?");
      if (exists) {
        return {
          status: 409,
          message: "Email already in use",
          error: true,
        };
      }

      const hashedPassword = await hash(password, 10);
      console.log("Did we get to make the user?");
      const result = await ctx.prisma.user.create({
        data: { username, email, password: hashedPassword },
      });

      console.log("Did we return the info");
      return {
        status: 201,
        message: "Account created successfully",
        result: result.email,
      };
    }),
});
