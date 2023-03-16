import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import {
  GuidelinesFaculty,
  GuidelinesFacultyToCourse,
  Course,
  CourseState,
  Prisma,
} from "@prisma/client";
import { prisma } from "src/server/db";

// Validation -----------------------------------------------------------------------------------------------------

// Essentially creates a new data type built to store comprehensive queries
const courseType = Prisma.validator<Prisma.CourseArgs>()({
  include: {
    faculty: {
      include: { faculty: true },
    },
    locations: {
      include: { rooms: true },
    },
  },
});
export type IScheduleCourse = Prisma.CourseGetPayload<typeof courseType>;

const facultyType = Prisma.validator<Prisma.GuidelinesFacultyArgs>()({
  include: {
    to_courses: {
      include: {
        course: { select: { revision_tuid: true } },
      },
    },
  },
});
export type IScheduleFaculty = Prisma.GuidelinesFacultyGetPayload<
  typeof facultyType
>;

// Routers --------------------------------------------------------------------------------------------------------

export const homeRouter = createTRPCRouter({
  getTotalFaculty: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Count total faculty members that are teaching courses on a specific revision

      let facultyCount = 0;

      // Grab all faculty, along with the revision ids of the courses they teach
      const allFaculty: IScheduleFaculty[] =
        await ctx.prisma.guidelinesFaculty.findMany({
          include: {
            to_courses: {
              include: {
                course: { select: { revision_tuid: true } },
              },
            },
          },
        });

      // Count the number of faculty with courses on the given revision
      for (const faculty of allFaculty) {
        let isOnRevision = false;
        for (const course of faculty.to_courses) {
          if (course.course.revision_tuid === input.tuid) {
            isOnRevision = true;
          }
        }
        if (isOnRevision) facultyCount += 1;
      }

      return { result: { totalFaculty: facultyCount } };
    }),

  getTotalCourses: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Count total courses on a specific revision
      const coursesCount = await ctx.prisma.course.count({
        where: {
          revision_tuid: input.tuid,
        },
      });
      return { result: { totalCourses: coursesCount } };
    }),

  getCoursesByState: protectedProcedure
    .input(
      z.object({
        tuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Search for all courses with the ADDED state on a specific revision
      const addedCourses: IScheduleCourse[] = await ctx.prisma.course.findMany({
        where: {
          state: CourseState.ADDED,
          revision_tuid: input.tuid,
        },
        include: {
          faculty: { include: { faculty: true } },
          locations: { include: { rooms: true } },
        },
      });

      // Search for all courses with the MODIFIED state on a specific revision
      const modifiedCourses: IScheduleCourse[] =
        await ctx.prisma.course.findMany({
          where: {
            state: CourseState.MODIFIED,
            revision_tuid: input.tuid,
          },
          include: {
            faculty: { include: { faculty: true } },
            locations: { include: { rooms: true } },
          },
        });

      // Search for all courses with the REMOVED state on a specific revision
      const removedCourses: IScheduleCourse[] =
        await ctx.prisma.course.findMany({
          where: {
            state: CourseState.REMOVED,
            revision_tuid: input.tuid,
          },
          include: {
            faculty: { include: { faculty: true } },
            locations: { include: { rooms: true } },
          },
        });

      // Build a result object by calling functions to format course data
      const result = {
        addedCourses: formatCourseData(addedCourses),
        modifiedCourses: formatCourseData(modifiedCourses),
        removedCourses: formatCourseData(removedCourses),
      };

      return { result: result };
    }),
});

function formatCourseData(courses: IScheduleCourse[]) {
  const coursesData = [];

  // For each course...
  for (const course of courses) {
    const facultyNames = [];
    const courseRooms = [];
    const courseTimes = [];

    // For each faculty member on a course, add their name to a list of faculty names
    for (const fac of course.faculty) {
      facultyNames.push((fac.faculty.name + " " + fac.faculty.suffix).trim());
    }

    // For each location on a course...
    for (const loc of course.locations) {
      // For each room on a location, add its name to a list of room names
      for (const room of loc.rooms) {
        courseRooms.push(room.room);
      }

      // For each day of the week, check if the course is scheduled on that day
      let courseDays = "";
      if (loc.day_monday) courseDays += "/M";
      if (loc.day_tuesday) courseDays += "/T";
      if (loc.day_wednesday) courseDays += "/W";
      if (loc.day_thursday) courseDays += "/TH";
      if (loc.day_friday) courseDays += "/F";
      if (loc.day_saturday) courseDays += "/SA";
      if (loc.day_sunday) courseDays += "/SU";
      courseDays = courseDays.substring(1);

      // Add the days and times the course is being taught to a list of days and times
      courseTimes.push(courseDays + " " + loc.start_time + "-" + loc.end_time);
    }

    // Add the course's faculty name(s), full course ID, title, room(s), and days and times
    coursesData.push({
      facultyNames: facultyNames,
      courseID:
        course.subject + "*" + course.course_number + "*" + course.section,
      courseTitle: course.title,
      courseLocation: courseRooms,
      courseTimes: courseTimes,
    });
  }

  return coursesData;
}
