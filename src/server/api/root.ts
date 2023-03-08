import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { routerAuth } from "./routers/auth";
import { buildingsRouter } from "./routers/buildings";
import { coursesRouter } from "./routers/courses";
import { projectsRouter } from "./routers/projects";
import { facultyRouter } from "./routers/faculty";
import { calendarRouter } from "./routers/calendar";
import { dashboardRouter } from "./routers/dashboard";
import { reportRouter } from "./routers/report";
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
  calendar: calendarRouter,
  dashboard: dashboardRouter,
  report: reportRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
