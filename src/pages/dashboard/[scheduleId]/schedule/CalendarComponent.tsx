import React from "react";
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
}

const militaryToGridRow = (time: number) => {
  let hour = Math.floor(time / 100);
  const minutes = parseInt(
    time > 1000
      ? time.toString().substring(2, 4)
      : time.toString().substring(2, 3)
  );
  if (time >= 800) {
    hour -= 8;
  }
  const total = (hour * 60 + minutes) / 10;
  return total;
};

const CourseListing = ({ courses }: CourseListingProps) => {
  return (
    <div className="flex w-full grow flex-col ">
      <div className="grid grid-flow-col grid-rows-72">
        {courses != null &&
          courses.map((course, index) => {
            const time = course.locations.find((loc) => {
              return loc.start_time != null && loc.end_time != null;
            });

            if (time == null) return <></>;

            const startRow = militaryToGridRow(time.start_time);
            const endRow = militaryToGridRow(time.end_time);

            return (
              <div
                key={index}
                className="border-2 border-black bg-red-100"
                style={{
                  gridRowStart: startRow,
                  gridRowEnd: endRow,
                }}
              >
                {course.title} {endRow}
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

const DayBlock = ({ title, courses }: DayBlockProps) => {
  return (
    <div className="flex w-full grow flex-col ">
      <div>{title}</div>
      {courses != undefined && <CourseListing courses={courses} />}
    </div>
  );
};

const ScheduleCalendar = ({
  children,
  semester,
  revision,
}: CalendarComponentProps) => {
  const result = api.calendar.getRevision.useQuery({
    tuid: "cleef0d6p006fl45clwlydnak",
    maxRoomNum: "4",
    minRoomNum: "0",
    semester_fall: semester == "FA",
    semester_winter: semester == "WI",
    semester_summer: semester == "SU",
    semester_spring: semester == "SP",
  });

  return (
    <div className="flex h-full w-full">
      <div className="w-[100px] border-r-2 border-base-200 p-2 text-center"></div>

      <div className="flex w-full flex-col">
        <div className="flex justify-between">
          <div>Monday</div>
          <div>Tuesday</div>
          <div>Wednesday</div>
          <div>Thursday</div>
          <div>Friday</div>
          <div>Saturday</div>
          <div>Sunday</div>
        </div>
        {result.data != undefined && (
          <div className="flex h-[400px] overflow-y-scroll">
            <CourseListing courses={result.data.monday_courses} />
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
