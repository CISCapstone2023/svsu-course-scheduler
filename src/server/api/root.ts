import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { routerAuth } from "./routers/auth";
import { buildingsRouter } from "./routers/buildings";
import { coursesRouter } from "./routers/courses";
import { projectsRouter } from "./routers/projects";
import { facultyRouter } from "./routers/faculty";
import { calendarRouter } from "./routers/calendar";
import { homeRouter } from "./routers/home";
import { dashboardRouter } from "./routers/dashboard";
import { reportRouter } from "./routers/report";
import { subjectRouter } from "./routers/subjects";
import { departmentRouter } from "./routers/departments";
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
  home: homeRouter,
  dashboard: dashboardRouter,
  report: reportRouter,
  subjects: subjectRouter,
  department: departmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
