import classNames from "classnames";

import { type IScheduleCourse } from "src/server/api/routers/calendar";
import { Lock } from "tabler-icons-react";

interface CourseListingProps {
  show: boolean; //Do we show the courses
  locked?: boolean; //Do we tell the user this is in lcoked mode
  courses: (IScheduleCourse & { withinGuideline: boolean })[] | undefined; //The course with data array
  overlap?: boolean; //Do we want to overlap courses in this mode?
  setCourseHover: (value: IScheduleCourseWithTimes | null) => void; //Hover event
  onSelect: (value: string) => void; //Selection event
  hover: IScheduleCourseWithTimes | null; //Hover data?
}

//TODO: Use the military to time in the utils
const militaryToSplit = (time: number) => {
  //initializes hour variable to parse integer time numbers
  const hour = parseInt(
    time >= 1000
      ? time.toString().substring(0, 2) //splits numbers of time to get ending numbers of set time
      : time.toString().substring(0, 1) // splits numbers of time to get begining numbers of set time
  ); // mods time to convert from military time to standard time
  let anteMeridiemHour = hour % 12;
  // conditional statement to reset hours to 12 if initial time is 12 since 12 mod 12 returns zero
  if (anteMeridiemHour == 0) {
    anteMeridiemHour = 12;
  }

  //initializes constant for getting the minutes of time
  const minute = parseInt(
    time.toString().substring(time.toString().length - 2)
  );

  //initializes constant to be used for AM/PM tagging on time
  const anteMeridiem = time >= 1100 ? "PM" : "AM";
  return {
    hour,
    minute,
    anteMeridiemHour,
    anteMeridiem,
    totalMinutes: hour * 60 + minute,
  };
};

export type IScheduleCourseWithTimes = IScheduleCourse & {
  startTime: number;
  endTime: number;
  difference: number;
  withinGuideline: boolean;
  faculty: {
    faculty: {
      name: string;
    };
  };
  locations: Array<{
    rooms: {
      building: {
        name: string;
        prefix: string;
      };
    };
  }>;
};

interface ICalendarMapping {
  top: number;
  totalMinutes: number;
  endTime: number;
  courses: IScheduleCourseWithTimes[];
}

interface ICalendarMappingJustified extends ICalendarMapping {
  indents: number;
}

/**
 * calendarMapping
 *
 * Maps courses to a calendar in a custom object
 *
 * - [course occurs same time]
 *      - [courses: biggest first, smallest last]
 * - indent amount
 * - totalMinutes
 * - endTime
 *
 * @param courses
 * @returns
 */
const calendarMapping = (courses: IScheduleCourse[]) => {
  /**
   * TIME MAPPING
   *
   * This make sure any course which pairs with the same start time are grouped together
   */
  const coursesReducedToTimePairs = courses.reduce(
    (prev, current, index, all) => {
      const course = current as IScheduleCourseWithTimes;
      //Get the first time from the current course location that's not null
      const time = current.locations.find((loc) => {
        return loc.start_time != null && loc.end_time != null;
      });

      //If the time is null, meaning there is no locations with proper times
      //the likeliness is said course is an online course
      if (time == null) {
        return prev;
      }

      //Do we have any previously added time blocks?
      if (prev.length > 0) {
        //First keep a company of the time from military (so it can be reused)
        const currentCourseTime = militaryToSplit(time.start_time);

        //Now see if we can find the same TIME for the NEXT course
        const index = prev.findIndex(
          (item) => item.totalMinutes == currentCourseTime.totalMinutes
        );

        //Also get the info about said course
        course.startTime = currentCourseTime.totalMinutes;
        course.endTime = militaryToSplit(time.end_time).totalMinutes;
        course.difference = course.endTime - course.startTime;

        //If we can't find a time already occupied
        if (index == -1) {
          //Now if we don't have any matching courses at the exact same time
          //we make a new entry with said course

          //480 is the pixel amount from the top
          prev.push({
            top: course.startTime - 480,
            totalMinutes: course.startTime,
            endTime: course.endTime,
            courses: [course],
          });
        } else {
          //Instead we add said course to the current time block

          //Also we put the "longest courses" end time at the end of the parent
          if (course.endTime > prev[index]!.endTime) {
            prev[index]!.endTime = course.endTime;
          }

          //Add the course
          prev[index]?.courses.push(course);
        }
      } else {
        //This is the starting procedure, always add the first course
        course.startTime = militaryToSplit(time.start_time).totalMinutes;
        course.endTime = militaryToSplit(time.end_time).totalMinutes;
        course.difference = course.endTime - course.startTime;

        prev.push({
          top: course.startTime - 480,
          totalMinutes: course.startTime,
          endTime: course.endTime,
          courses: [course],
        });
      }
      //Return the prevous value (which is an array of ICalendarMapping)
      return prev;
    },
    [] as Array<ICalendarMapping>
  );

  //Now to sort out the base parent by first having the courses sorted by difference
  //and the parent by its totalMinutes (aka starting position)
  const sorted = coursesReducedToTimePairs
    .map((block) => {
      return {
        ...block,
        courses: block.courses.sort((a, b) => {
          return b.difference - a.difference;
        }),
      };
    })
    .sort((a, b) => {
      return a.totalMinutes - b.totalMinutes;
    });

  /**
   * INDENTING
   *
   * This calculates the indenting of a course by going backwards from the previous times
   * and checking if the current total minutes (start time) is before a prevoius courses
   * end time. If so its indent. It also bases the indent on said courses previous time.
   *
   * Because this is a reversed array we can assume that a course will only be blocked back once?
   *
   * TODO: Check if breaking out of the foor loop is needed. As it could possible be.
   */
  const prev = [] as Array<ICalendarMappingJustified>;

  //Grab the sorted
  for (const current of sorted) {
    //Total amount of indents
    let indents = 0;
    //Loop only if we have a previous
    if (prev.length > 0) {
      //Get all previous ones in reverse
      for (const block of prev.reverse()) {
        //Check if the current course block time is past the end time of the previous
        if (current.totalMinutes < block.endTime) {
          //If so we assume the previous block times could have been modified,
          //so we grab their indent and add one so <OURS> is <PARENT> + 1
          indents = block.indents + 1;
          break;
        }
      }
    }
    //Add the indent value with the current data back into the array
    prev.push({ ...current, indents });
  }

  //Resort the array because it gets all out of sync for some reason
  const resort = prev.sort((a, b) => {
    return a.totalMinutes - b.totalMinutes;
  });

  //Return the resort of the data
  return resort;
};

const CourseListing = ({
  show,
  courses,
  overlap = true,
  locked = false,
  setCourseHover,
  hover,
  onSelect,
}: CourseListingProps) => {
  //Get the mapped version of the calendar from the list of courses
  let mapped = [] as ICalendarMappingJustified[];
  if (courses != undefined) {
    mapped = calendarMapping(courses);
  }
  return (
    <>
      {" "}
      {show && (
        <div className="wrap relative flex h-[900px]  grow border-r border-base-300">
          <div className="relative w-full grow basis-0">
            {mapped.splice(0).map((block, index) => {
              return (
                <div
                  key={index}
                  className="absolute w-full "
                  style={{
                    top: block.top + 1,
                    left: block.indents * 10,
                  }}
                >
                  <div className="flex w-full flex-row p-1">
                    {block.courses.map((course, index) => {
                      return (
                        <div
                          key={index + course.tuid}
                          style={{ height: (course.difference / 10) * 10 }}
                          onMouseEnter={() => setCourseHover(course)}
                          onMouseLeave={() => setCourseHover(null)}
                          tabIndex={index}
                          onClick={() => {
                            onSelect(course.tuid);
                          }}
                          className={classNames(
                            "z-[100] flex w-32 cursor-pointer overflow-hidden text-ellipsis rounded-lg border border-base-100 bg-base-200 transition-all duration-150 hover:z-[999] hover:shadow-lg",
                            {
                              "-ml-10": index > 0 && overlap,
                              "z-[999] shadow-lg":
                                hover != null && hover.tuid == course.tuid,
                              "bg-base-300":
                                hover != null &&
                                hover.tuid == course.tuid &&
                                course.withinGuideline,
                              "mr-10":
                                hover != null &&
                                hover.tuid == course.tuid &&
                                block.courses.length - 1 != index,
                              //Check the state
                              "border-[3px] border-green-400":
                                course.state == "ADDED",
                              "border-[3px] border-yellow-400":
                                course.state == "MODIFIED",
                              "border-[3px] border-red-400":
                                course.state == "REMOVED",
                            }
                          )}
                        >
                          <div
                            className={classNames("flex h-full w-full p-1", {
                              "bg-red-100": !course.withinGuideline,
                            })}
                          >
                            <p style={{ fontSize: 12 }}>
                              <p className="text-md font-bold">
                                {course.subject} - {course.course_number} -{" "}
                                {course.section}
                              </p>{" "}
                              {course.title}
                            </p>
                            {locked && (
                              <Lock className="inline" width={20} height={20} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {/* Create the lines for the current day */}
            {Array(15)
              .fill(0)
              .map(function (x, i) {
                return (
                  <div
                    key={i}
                    className="absolute w-full"
                    style={{
                      top: i * 60 + 34,
                      left: 0,
                    }}
                  >
                    <div key={i} className="flex flex-row text-center">
                      <div className="flex  w-full items-center border-b border-base-300 bg-base-200 text-sm"></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
};

export default CourseListing;
