import classNames from "classnames";
import { difference, isEqual } from "lodash";
import React, { useEffect, useState } from "react";
import { Button } from "react-daisyui";
import { start } from "repl";
import AnimatedSpinner from "src/components/AnimatedSpinner";
import {
  IScheduleCourse,
  RevisionWithCourses,
} from "src/server/api/routers/calendar";
import { api } from "src/utils/api";
import { number } from "zod";
import CalendarWeekdayHeader from "./calendar/CalendarWeekdayHeader";

interface CourseListingProps {
  show: boolean;
  courses: (IScheduleCourse & { withinGuideline: boolean })[] | undefined;
  overlap?: boolean;
  setCourseHover: (value: IScheduleCourseWithTimes | null) => void;
  onSelect: (value: string) => void;
  hover: IScheduleCourseWithTimes | null;
}

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
  const anteMeridiem = time >= 1300 ? "PM" : "AM";
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
        console.log("Online course");
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

  //Resor the array because it gets all out of sync for some reason
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
  setCourseHover,
  hover,
  onSelect,
}: CourseListingProps) => {
  //Get the mapped version of the calendar from the list of courses
  const mapped = calendarMapping(courses!);

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
                            className={classNames("h-full w-full p-2", {
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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

/**
 * CalendarComponentProps
 *
 * Properties for the calendar
 *
 */
interface CalendarComponentProps {
  children?: React.ReactNode;
  semester: "FA" | "WI" | "SP" | "SU"; //What semsester is this calendar?
  revision: string; //What revision tuid is this calendar?
  update?: boolean; //Do we want to refetch this calendar? (true or false both update when toggled)
  weekends: boolean; //List of possible weekends to show
  onSelect: (course: string) => void; //Event when an course is selected
  onCourseHover: (course: IScheduleCourseWithTimes) => void; //Eent when the mouse hovers over a course
}

interface Days {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

const ScheduleCalendar = ({
  semester,
  weekends = false,
  update,
  revision,
  onSelect,
  onCourseHover,
}: CalendarComponentProps) => {
  //Hover state of the current scheduler
  const [hover, setCourseHover] = useState<IScheduleCourseWithTimes | null>(
    null
  );

  //Update check, but passing in depdency to update on the prop change,
  //this will call refetch on the query bekow
  useEffect(() => {
    result.refetch();
  }, [update]);

  //The query if data based on the semester passed in
  const result = api.calendar.getRevision.useQuery({
    tuid: revision,
    maxRoomNum: "4",
    minRoomNum: "0",
    semester_fall: semester == "FA",
    semester_winter: semester == "WI",
    semester_summer: semester == "SU",
    semester_spring: semester == "SP",
  });

  const [sections, setOpenSections] = useState<Days>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  //List of possible times
  const times = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
  ];

  const updateSectionViews = (days: Days) => {
    if (isEqual(days, sections)) {
      setOpenSections({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      });
    } else {
      setOpenSections(days);
    }
  };

  //HTML/JSX Rendering
  return (
    <div className="h-full overflow-hidden">
      <div className="flex h-7 flex-row justify-evenly">
        <div className="relative flex w-[70px] border-r border-b border-base-300">
          <div
            className="absolute  "
            style={{
              top: 0,
              left: 0,
            }}
          >
            Time
          </div>
        </div>
        <CalendarWeekdayHeader
          weekday="Monday"
          active={sections.monday}
          onClick={() => {
            updateSectionViews({
              monday: true,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false,
            });
          }}
        />
        <CalendarWeekdayHeader
          weekday="Tuesday"
          active={sections.tuesday}
          onClick={() => {
            updateSectionViews({
              monday: false,
              tuesday: true,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false,
            });
          }}
        />
        <CalendarWeekdayHeader
          weekday="Wednesday"
          active={sections.wednesday}
          onClick={() => {
            updateSectionViews({
              monday: false,
              tuesday: false,
              wednesday: true,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false,
            });
          }}
        />
        <CalendarWeekdayHeader
          weekday="Thursday"
          active={sections.thursday}
          onClick={() => {
            updateSectionViews({
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: true,
              friday: false,
              saturday: false,
              sunday: false,
            });
          }}
        />
        <CalendarWeekdayHeader
          weekday="Friday"
          active={sections.friday}
          onClick={() => {
            updateSectionViews({
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: true,
              saturday: false,
              sunday: false,
            });
          }}
        />
        {weekends && (
          <>
            <CalendarWeekdayHeader weekday="Saturday" />
            <CalendarWeekdayHeader weekday="Sunday" />
          </>
        )}
      </div>
      <div className="flex h-full w-full overflow-y-scroll">
        <div className="flex h-[900px] w-full flex-col">
          {result.data != undefined && (
            <div className="flex h-full flex-row justify-evenly">
              <div className="wrap relative flex h-full w-[70px]  border-r border-base-300">
                <div className="relative grow basis-0  ">
                  {times.map(function (x, i) {
                    return (
                      <div
                        key={i}
                        className="absolute w-full "
                        style={{
                          top: i * 60,
                          left: 0,
                        }}
                      >
                        <div key={i} className="flex flex-row text-center">
                          <div className="justi flex h-4 w-full -translate-y-1 items-center bg-base-200  text-sm">
                            {x}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {times.map(function (x, i) {
                    return (
                      <div
                        key={i}
                        className="absolute w-full "
                        style={{
                          top: i * 60 + 34,
                          left: 0,
                        }}
                      >
                        <div key={i} className="flex flex-row text-center">
                          <div className=" flex  w-full items-center border-b border-base-300 bg-base-200  text-sm"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <CourseListing
                show={sections.monday}
                onSelect={onSelect}
                courses={result.data.monday_courses}
                setCourseHover={(course) => {
                  setCourseHover(course);
                  onCourseHover(course!);
                }}
                hover={hover}
              />
              <CourseListing
                show={sections.tuesday}
                onSelect={onSelect}
                courses={result.data.tuesday_courses}
                setCourseHover={(course) => {
                  setCourseHover(course);
                  onCourseHover(course!);
                }}
                hover={hover}
              />
              <CourseListing
                show={sections.wednesday}
                onSelect={onSelect}
                courses={result.data.wednesday_courses}
                setCourseHover={(course) => {
                  setCourseHover(course);
                  onCourseHover(course!);
                }}
                hover={hover}
              />
              <CourseListing
                show={sections.thursday}
                onSelect={onSelect}
                courses={result.data.thursday_courses}
                setCourseHover={(course) => {
                  setCourseHover(course);
                  onCourseHover(course!);
                }}
                hover={hover}
              />
              <CourseListing
                show={sections.friday}
                onSelect={onSelect}
                courses={result.data.friday_courses}
                setCourseHover={(course) => {
                  setCourseHover(course);
                  onCourseHover(course!);
                }}
                hover={hover}
              />
              {/*Do we want to show the weekends? */}
              {weekends && (
                <>
                  <CourseListing
                    show={sections.saturday}
                    onSelect={onSelect}
                    courses={result.data.saturday_courses}
                    setCourseHover={(course) => {
                      setCourseHover(course);
                      onCourseHover(course!);
                    }}
                    hover={hover}
                  />
                  <CourseListing
                    show={sections.sunday}
                    onSelect={onSelect}
                    courses={result.data.sunday_courses}
                    setCourseHover={(course) => {
                      setCourseHover(course);
                      onCourseHover(course!);
                    }}
                    hover={hover}
                  />
                </>
              )}
            </div>
          )}
          {/* Make a spinner show if we have no calendar data loaded */}
          {result.data == undefined && (
            <div className="flex h-[200px] w-full flex-col items-center justify-center">
              <AnimatedSpinner />
              <p>Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ScheduleCalendar);
