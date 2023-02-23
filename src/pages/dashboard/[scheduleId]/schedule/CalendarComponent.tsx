import classNames from "classnames";
import { difference } from "lodash";
import React, { useEffect } from "react";
import { Button } from "react-daisyui";
import { start } from "repl";
import {
  IScheduleCourse,
  RevisionWithCourses,
} from "src/server/api/routers/calendar";
import { api } from "src/utils/api";
import { number } from "zod";

interface CalendarComponentProps {
  children?: React.ReactNode;
  semester: "FA" | "WI" | "SP" | "SU";
  revision: string;
}

interface CourseListingProps {
  courses: IScheduleCourse[] | undefined;
  overlap?: boolean;
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

const CourseListing = ({ courses, overlap = true }: CourseListingProps) => {
  const mapped = calendarMapping(courses!);

  return (
    <div className="wrap relative flex  grow overflow-x-scroll border border-black">
      <div className="relative w-full grow basis-0">
        {mapped.map((block, index) => {
          return (
            <div
              key={index}
              className="absolute w-full "
              style={{
                top: block.totalMinutes - 510,
                left: block.indents * 10,
              }}
            >
              <div className="flex flex-row p-1">
                {block.courses.map((course, index) => {
                  return (
                    <div
                      key={index + course.tuid}
                      style={{ height: (course.difference / 10) * 4 }}
                      className={classNames(
                        "hover:z-99 flex w-16 rounded-lg border  border-base-100 bg-base-300 p-2 transition-all duration-150 hover:z-[999]  hover:shadow-lg",
                        {
                          "-ml-10": index > 0 && overlap,
                          "hover:mr-10": block.courses.length - 1 != index,
                        }
                      )}
                    >
                      <p style={{ fontSize: 8 }}>{course.difference}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface DayBlockProps {
  title: string;
  courses: IScheduleCourse[] | undefined;
}

const ScheduleCalendar = ({
  children,
  semester,
  revision,
}: CalendarComponentProps) => {
  const result = api.calendar.getRevision.useQuery({
    tuid: "cleh9smil00cmg966cshwt5h5",
    maxRoomNum: "4",
    minRoomNum: "0",
    semester_fall: semester == "FA",
    semester_winter: semester == "WI",
    semester_summer: semester == "SU",
    semester_spring: semester == "SP",
  });

  return (
    <div className="flex h-full w-full">
      <div className="flex w-full flex-col">
        <div className="flex ">
          <div className="grow">Monday</div>
          <div className="grow">Tuesday</div>
          <div className="grow">Wednesday</div>
          <div className="grow">Thursday</div>
          <div className="grow">Friday</div>
          <div className="grow">Saturday</div>
          <div className="grow">Sunday</div>
        </div>
        {result.data != undefined && (
          <div className="overflow-y-scr flex h-[720px] flex-row justify-evenly">
            <CourseListing
              courses={result.data.monday_courses}
              overlap={false}
            />
            <CourseListing courses={result.data.tuesday_courses} />
            <CourseListing courses={result.data.wednesday_courses} />
            <CourseListing courses={result.data.thursday_courses} />
            <CourseListing courses={result.data.friday_courses} />
            <CourseListing courses={result.data.saturday_courses} />
            <CourseListing courses={result.data.sunday_courses} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
