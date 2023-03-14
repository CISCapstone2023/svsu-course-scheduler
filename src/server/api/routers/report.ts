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
            every: {
              course: {
                revision: {
                  tuid: input.tuid,
                },
                OR: [
                  input.semester_fall ? { semester_fall: true } : {},
                  input.semester_winter ? { semester_winter: true } : {},
                  input.semester_spring ? { semester_spring: true } : {},
                  input.semester_summer ? { semester_summer: true } : {},
                ],
              },
            },
          },
          //If the user searches for a certain faculty then check if the name contains
          //the user's search, otherwise don't filter by name
          ...(input.search != "" ? { name: { contains: input.search } } : {}),
        },
        include: {
          to_courses: {
            include: {
              course: {
                include: {
                  locations: {
                    include: {
                      rooms: {
                        include: {
                          building: true,
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
      //Map each faculty member from the above query to return an array of objects
      //with each faculty member, their courses taught and total number of credits taught
      //and send it to the front end
      const faculties = courseResult.map((faculty) => {
        //Get the total amount of credits that a faculty member is teaching
        const totalCredits = faculty.to_courses
          .map((toCourse) => {
            return toCourse.course.credits;
          })
          .reduce((sum, value) => {
            return sum + value;
          }, 0);
        return { totalCredits, ...faculty };
      });

      //return the faculties array of objects
      return faculties;
    }),
});
