import NextAuth, { type NextAuthOptions } from "next-auth";

// Prisma adapter for NextAuth
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";

//Argon (Hashing)
import { compare } from "bcrypt";

//Import the local files for environment files, prisma and schema
import { env } from "src/env/server.mjs";
import { prisma } from "src/server/db";
import { signInSchema } from "src/validation/auth";

/**
 * NextAuth Options
 *
 * This provides the basic options for authentication for this project.
 * Normally a provider for OAuth like "Sign in with <Google/Microsoft/etc>"
 * would be used but as we don't need to directly rely on a provider we can
 * actually use usernames and passwords but creating our own authorization (hashing)
 *
 * NOTE: The NextJSAuth documentation warns against doing this.
 * A solution to this fix would allow SVSU login via Microsoft Azure Active Directory
 * but again that will be highly unlikely for security policy reasons so this shall
 * suffice for the project unless required.
 */
export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    //Convert user to a JWT
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
      }
      return token;
    },
    //Convert a JWT to a Session
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  //Default the session strategy to JWT
  session: {
    strategy: "jwt",
  },
  //Use the secret provided in the ENV file
  secret: env.NEXTAUTH_SECRET,

  //Set a max age, ideally expire in less than a month.
  jwt: {
    maxAge: 15 * 24 * 30 * 60,
  },

  //Redirects to pages for the authentication.
  pages: {
    signIn: "/",
    newUser: "/sign-up",
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: {
          label: "Email",
          type: "email",
          placeholder: "bob@svsu.edu",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        //Verify the credentials via the schema validations
        const creds = await signInSchema.parseAsync(credentials);

        //Now query the user from prisma
        const user = await prisma.user.findFirst({
          where: { email: creds.email },
        });

        //Do we have a user that matched the query?
        //If not just return nothing
        if (!user) {
          return null;
        }

        //Now very the password with argon2
        const isValidPassword = await compare(creds.password, user.password);

        //If the password is NOT valid, then return null
        if (!isValidPassword) {
          return null;
        }

        //But if everything does pass, return some information!
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],
};

//Export the options and call a function to create the NextAuth instance
export default NextAuth(authOptions);
