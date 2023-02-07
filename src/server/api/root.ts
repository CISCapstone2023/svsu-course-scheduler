import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { routerAuth } from "./routers/auth";
import { buildingsRouter } from "./routers/buildings";
import { coursesRouter } from "./routers/courses";
import { projectsRouter } from "./routers/projects";
import { facultyRouter } from "./routers/faculty";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  auth: routerAuth,
  buildings: buildingsRouter,
  courses: coursesRouter,
  projects: projectsRouter,
  faculty: facultyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
