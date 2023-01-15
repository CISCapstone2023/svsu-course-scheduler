import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { routerAuth } from "./routers/auth";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  auth: routerAuth,
});

// export type definition of API
export type AppRouter = typeof appRouter;
