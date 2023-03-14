// import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { CourseState, Prisma } from "@prisma/client";

const coursesWithLocationAndFaculty = Prisma.validator<Prisma.CourseArgs>()({
  include: {
    faculty: { include: { faculty: true } },
    locations: true,
  },
});
export type CoursesWithLocationAndFaculty = Prisma.CourseGetPayload<
  typeof coursesWithLocationAndFaculty
>;

export const homeRouter = createTRPCRouter({
  getTotalFaculty: protectedProcedure.query(async ({ ctx }) => {
    const facultyCount = ctx.prisma.guidelinesFaculty.count();
    return { result: facultyCount };
  }),

  getTotalCourses: protectedProcedure.query(async ({ ctx }) => {
    const coursesCount = ctx.prisma.course.count();
    return { result: coursesCount };
  }),

  getCoursesByState: protectedProcedure.query(async ({ ctx }) => {
    const addedCourses: CoursesWithLocationAndFaculty[] =
      await ctx.prisma.course.findMany({
        where: {
          state: CourseState.ADDED,
        },
        include: {
          faculty: { include: { faculty: true } },
          locations: true,
        },
      });

    const modifiedCourses: CoursesWithLocationAndFaculty[] =
      await ctx.prisma.course.findMany({
        where: {
          state: CourseState.MODIFIED,
        },
        include: {
          faculty: { include: { faculty: true } },
          locations: true,
        },
      });

    const removedCourses: CoursesWithLocationAndFaculty[] =
      await ctx.prisma.course.findMany({
        where: {
          state: CourseState.REMOVED,
        },
        include: {
          faculty: { include: { faculty: true } },
          locations: true,
        },
      });

    const result = {
      addedCourses: formatCourseData(addedCourses),
      modifiedCourses: formatCourseData(modifiedCourses),
      removedCourses: formatCourseData(removedCourses),
    };

    return { result: result };
  }),
});

function formatCourseData(courses: CoursesWithLocationAndFaculty[]) {
  const coursesData = [];

  for (const course of courses) {
    coursesData.push({
      facultyName: course.faculty,
      courseID:
        course.department +
        " " +
        course.course_number +
        " " +
        course.section_id,
      courseTitle: course.title,
      courseLocation: course.locations,
    });
  }

  return coursesData;
}
