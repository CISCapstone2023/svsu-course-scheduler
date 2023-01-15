import { type GetServerSidePropsContext } from "next";
import { type Session, unstable_getServerSession } from "next-auth";

import { authOptions } from "src/pages/api/auth/[...nextauth]";

/**
 * Wrapper for unstable_getServerSession, used in trpc createContext and the
 * restricted API route
 *
 * Don't worry too much about the "unstable", it's safe to use but the syntax
 * may change in future versions
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */

export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return await unstable_getServerSession(ctx.req, ctx.res, authOptions);
};

type ServerSideSession = (
  ctx: GetServerSidePropsContext,
  session: Session | null
) => void;

/**
 * A local route wrapper. This allows for getServerSideProps to be intercepted (like a middleware)
 * and we can either allow the request, or deny it. This basically can be used to get
 *
 *
 */
export const routeNeedsAuthSession =
  (func: ServerSideSession, redirect = true) =>
  async (ctx: GetServerSidePropsContext) => {
    const session = await unstable_getServerSession(
      ctx.req,
      ctx.res,
      authOptions
    );

    if (!session && redirect) {
      return {
        redirect: {
          destination: "/", //Path to the Login Screen
          permanent: false,
        },
      };
    }

    return await func(ctx, session);
  };
