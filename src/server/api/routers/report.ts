import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";

//Router to generate reports on the report page
export const reportRouter = createTRPCRouter({
  //Gets all faculty including all the courses they teach and the total
  //number of credits that they teach
  getAllReports: protectedProcedure
    .input(
      z.object({
        semester_fall: z.boolean(),
        semester_winter: z.boolean(),
        semester_spring: z.boolean(),
        semester_summer: z.boolean(),
        search: z.string(),
        tuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      //Query to get an array of faculty objects that match the semester given
      //by the user and the search string if it is not empty.
      const courseResult = await ctx.prisma.guidelinesFaculty.findMany({
        where: {
          to_courses: {
            some: {
              course: {
                is: {
                  OR: [
                    input.semester_fall ? { semester_fall: true } : {},
                    input.semester_winter ? { semester_winter: true } : {},
                    input.semester_spring ? { semester_spring: true } : {},
                    input.semester_summer ? { semester_summer: true } : {},
                  ],
                  revision: {
                    is: {
                      tuid: input.tuid,
                    },
                  },
                },
              },
            },
          },
          //If the user searches for a certain faculty then check if the name contains
          //the user's search, otherwise don't filter by name
          ...(input.search != "" ? { name: { contains: input.search } } : {}),
        },
        select: {
          name: true,
          to_courses: {
            select: {
              course: {
                select: {
                  revision: {
                    select: {
                      tuid: true,
                    },
                  },
                  semester_fall: true,
                  semester_spring: true,
                  semester_summer: true,
                  semester_winter: true,
                  instruction_method: true,
                  credits: true,
                  title: true,
                  locations: {
                    select: {
                      day_monday: true,
                      day_tuesday: true,
                      day_wednesday: true,
                      day_thursday: true,
                      day_friday: true,
                      day_saturday: true,
                      day_sunday: true,
                      start_time: true,
                      end_time: true,
                      rooms: {
                        select: {
                          room: true,
                          building: {
                            select: {
                              name: true,
                              campus: {
                                select: {
                                  name: true,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      //only search for semester of the revision
      const AllCourseResult = await ctx.prisma.guidelinesFaculty.findMany({
        where: {
          to_courses: {
            some: {
              course: {
                is: {
                  OR: [
                    true ? { semester_fall: true } : {},
                    true ? { semester_winter: true } : {},
                    true ? { semester_spring: true } : {},
                    true ? { semester_summer: true } : {},
                  ],
                  revision: {
                    is: {
                      tuid: input.tuid,
                    },
                  },
                },
              },
            },
          },
        },
        select: {
          name: true,
          to_courses: {
            select: {
              course: {
                select: {
                  revision: {
                    select: {
                      tuid: true,
                    },
                  },
                  semester_fall: true,
                  semester_spring: true,
                  semester_summer: true,
                  semester_winter: true,
                },
              },
            },
          },
        },
      });
      let isFall = false;
      let isSpring = false;
      let isSummer = false;
      let isWinter = false;
      //this find out what semester the revision cover
      AllCourseResult.map((faculty) => {
        const to_courses = faculty.to_courses.filter((to_course) => {
          return to_course.course.revision.tuid == input.tuid;
        });
        to_courses.forEach((toCourse) => {
          if (toCourse.course.semester_fall == true && isFall == false)
            isFall = true;

          if (toCourse.course.semester_spring == true && isSpring == false)
            isSpring = true;

          if (toCourse.course.semester_summer == true && isSummer == false)
            isSummer = true;

          if (toCourse.course.semester_winter == true && isWinter == false)
            isWinter = true;
        });
      });

      //Map each faculty member from the above query to return an array of objects
      //with each faculty member, their courses taught and total number of credits taught
      //and send it to the front end
      const faculties = courseResult.map((faculty) => {
        const to_courses = faculty.to_courses.filter((to_course) => {
          return to_course.course.revision.tuid == input.tuid;
        });

        //Get the total amount of credits that a faculty member is teaching
        const totalCredits = to_courses
          .map((toCourse) => {
            return toCourse.course.credits;
          })
          .reduce((sum, value) => {
            return sum + value;
          }, 0);
        return {
          totalCredits,
          ...faculty,
          to_courses,
        };
      });

      //return the faculties array of objects
      return { faculties, isFall, isSpring, isSummer, isWinter };
    }),
});
