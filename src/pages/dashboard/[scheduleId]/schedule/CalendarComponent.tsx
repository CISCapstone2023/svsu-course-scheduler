import classNames from "classnames";
import { difference } from "lodash";
import React, { useEffect, useState } from "react";
import { Button } from "react-daisyui";
import { start } from "repl";
import {
  IScheduleCourse,
  RevisionWithCourses,
} from "src/server/api/routers/calendar";
import { api } from "src/utils/api";
import { number } from "zod";

interface CourseListingProps {
  courses: IScheduleCourse[] | undefined;
  overlap?: boolean;
  setCourseHover: (value: string | null) => void;
  hover: string | null;
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

type IScheduleCourseWithTimes = IScheduleCourse & {
  startTime: number;
  endTime: number;
  difference: number;
};

interface ICalendarMapping {
  top: number;
  totalMinutes: number;
  endTime: number;
  online: boolean;
  courses: IScheduleCourseWithTimes[];
}

interface ICalendarMappingJustified extends ICalendarMapping {
  indents: number;
}

const calendarMapping = (courses: IScheduleCourse[]) => {
  const out = courses.reduce((prev, current, index, all) => {
    const course = current as IScheduleCourseWithTimes;
    //Get the first time from the current course location that's not null
    const time = current.locations.find((loc) => {
      return loc.start_time != null && loc.end_time != null;
    });

    //If the time is null, meaning there is no locations with proper times
    //the likeliness is said course is an online course
    if (time == null) {
      console.log("This course is missing a time");
      console.log({ current });
      console.log("THIS COURSE SHOULD BE AN ONLINE COURSE THEN");
      return prev;
    }

    //Do we have any previously added time blocks?
    if (prev.length > 0) {
      //First keep a company of the time from military (so it can be reused)
      const currentCourseTime = militaryToSplit(time.start_time);

      console.table({ currentCourseTime });

      const index = prev.findIndex(
        (item) => item.totalMinutes == currentCourseTime.totalMinutes
      );

      course.startTime = currentCourseTime.totalMinutes;
      course.endTime = militaryToSplit(time.end_time).totalMinutes;
      course.difference = course.endTime - course.startTime;

      if (index == -1) {
        //now if we don't have any matching courses at the exact same time
        //we make a new entry with said course

        prev.push({
          top: course.startTime - 480,
          totalMinutes: course.startTime,
          endTime: course.endTime,
          online: false,
          courses: [course],
        });
      } else {
        //Instead we add said course to the current time block

        // totalMinutes:30,courses:[course1,course2]

        if (course.endTime > prev[index]!.endTime) {
          prev[index]!.endTime = course.endTime;
        }

        prev[index]?.courses.push(course);
      }
    } else {
      course.startTime = militaryToSplit(time.start_time).totalMinutes;
      course.endTime = militaryToSplit(time.end_time).totalMinutes;
      course.difference = course.endTime - course.startTime;

      prev.push({
        top: course.startTime - 480,
        totalMinutes: course.startTime,
        endTime: course.endTime,
        online: false,
        courses: [course],
      });
    }

    return prev;
  }, [] as Array<ICalendarMapping>);

  const sorted = out
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

  const prev = [] as Array<ICalendarMappingJustified>;

  for (const current of sorted) {
    let indents = 0;
    if (prev.length > 0) {
      for (const block of prev.reverse()) {
        if (current.totalMinutes < block.endTime) {
          indents = block.indents + 1;
        }
      }
    }
    prev.push({ ...current, indents });
  }

  const resort = prev.sort((a, b) => {
    return a.totalMinutes - b.totalMinutes;
  });

  return resort;
};

const CourseListing = ({
  courses,
  overlap = true,
  setCourseHover,
  hover,
}: CourseListingProps) => {
  const mapped = calendarMapping(courses!);

  return (
    <div className="wrap relative flex  grow border-r border-base-300">
      <div className="relative w-full grow basis-0  ">
        {mapped.map((block, index) => {
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
                      onMouseEnter={() => setCourseHover(course.tuid)}
                      onMouseLeave={() => setCourseHover(null)}
                      className={classNames(
                        "flex w-32 cursor-pointer overflow-hidden text-ellipsis rounded-lg border border-base-100 bg-base-200 p-2 transition-all duration-150 hover:z-[999] hover:shadow-lg",
                        {
                          "-ml-10": index > 0 && overlap,

                          "z-[999] bg-base-300 shadow-lg":
                            hover != null && hover == course.tuid,
                          "mr-10":
                            hover != null &&
                            hover == course.tuid &&
                            block.courses.length - 1 != index,
                          "border-green-400": course.state == "ADDED",
                        }
                      )}
                    >
                      <p style={{ fontSize: 12 }}>
                        <p className="text-md font-bold">
                          {course.subject} - {course.course_number}
                        </p>{" "}
                        {course.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {Array(16)
          .fill(0)
          .map(function (x, i) {
            return (
              <div
                key={i}
                className="absolute z-0 w-full"
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
  );
};

interface CalendarComponentProps {
  children?: React.ReactNode;
  semester: "FA" | "WI" | "SP" | "SU";
  revision: string;
  weekends: boolean;
}

const ScheduleCalendar = ({
  children,
  semester,
  weekends = false,
  revision,
}: CalendarComponentProps) => {
  const [hover, setCousreHover] = useState<string | null>(null);

  const result = api.calendar.getRevision.useQuery({
    tuid: "cleh9smil00cmg966cshwt5h5",
    maxRoomNum: "4",
    minRoomNum: "0",
    semester_fall: semester == "FA",
    semester_winter: semester == "WI",
    semester_summer: semester == "SU",
    semester_spring: semester == "SP",
  });

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

  return (
    <div className="h-full overflow-hidden">
      <div className="flex border-b border-base-300">
        <div className="grow">Time</div>
        <div className="grow">Monday</div>
        <div className="grow">Tuesday</div>
        <div className="grow">Wednesday</div>
        <div className="grow">Thursday</div>
        <div className="grow">Friday</div>
        {weekends && (
          <>
            <div className="grow">Saturday</div>
            <div className="grow">Sunday</div>
          </>
        )}
      </div>
      <div className="flex h-full w-full overflow-y-scroll">
        <div className="flex h-[750px] w-full flex-col">
          {result.data != undefined && (
            <div className="flex h-full flex-row justify-evenly">
              <div className="wrap relative flex h-full w-[70px]  border-r border-base-300">
                <div className="relative  grow basis-0  ">
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
                          <div className="justi flex h-4 w-full items-center bg-base-200  text-sm">
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
                courses={result.data.monday_courses}
                setCourseHover={setCousreHover}
                hover={hover}
              />
              <CourseListing
                courses={result.data.tuesday_courses}
                setCourseHover={setCousreHover}
                hover={hover}
              />
              <CourseListing
                courses={result.data.wednesday_courses}
                setCourseHover={setCousreHover}
                hover={hover}
              />
              <CourseListing
                courses={result.data.thursday_courses}
                setCourseHover={setCousreHover}
                hover={hover}
              />
              <CourseListing
                courses={result.data.friday_courses}
                setCourseHover={setCousreHover}
                hover={hover}
              />
              {weekends && (
                <>
                  <CourseListing
                    courses={result.data.saturday_courses}
                    setCourseHover={setCousreHover}
                    hover={hover}
                  />
                  <CourseListing
                    courses={result.data.sunday_courses}
                    setCourseHover={setCousreHover}
                    hover={hover}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
