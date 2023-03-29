import React from "react";
import militaryToTime from "src/utils/time";
import { type IScheduleCourseWithTimes } from "./calendar/CalendarCourseListing";

/**
 * Course Information Properties
 *
 * Default properties for this component
 *
 * @author Brendan Fuller
 */
interface CourseInformationSidebarProps {
  course: IScheduleCourseWithTimes | null | undefined;
}

/**
 * CourseInformationSidebar
 *
 * This component shows information about a course when hovered.
 *
 * @param couse (IScheduleCourseWithTimes)
 * @returns
 */
const CourseInformationSidebar = ({
  course,
}: CourseInformationSidebarProps) => {
  return (
    <>
      <div className="flex h-full w-[300px] flex-col bg-base-200 p-2 pt-4 text-sm">
        {course != undefined && (
          <>
            <div className="justify flex h-20 items-center justify-center">
              <div className="w-[200px] text-center">
                <p className="paragraph">
                  <strong> {course.title}</strong>
                </p>
              </div>
            </div>
            <div className="border-b-[1px] border-gray-400"></div>
            <CourseInfoItem
              title="Section ID"
              value={course.section_id == null ? "?" : course.section_id}
            />
            <CourseInfoItem title="Department" value={course.department} />
            <CourseInfoItem title="Subject" value={course.subject} />
            <CourseInfoItem
              title="Course Number"
              value={course.course_number}
            />
            <CourseInfoItem title="Course Section" value={course.section} />

            <div className="border-b-[1px] border-gray-400"></div>
            <CourseInfoItem
              title="Start Date"
              value={course.start_date.toLocaleString().split(",")[0]!}
            />
            <CourseInfoItem
              title="End Date"
              value={course.end_date.toLocaleString().split(",")[0]!}
            />
            <div className="border-b-[1px] border-gray-400"></div>
            <p className="font-bold">Faculty</p>
            <ul>
              {course.faculty.map((faculty, index) => {
                return <li key={index}>- {faculty.faculty.name}</li>;
              })}
            </ul>

            <div className="border-b-[1px] border-gray-400"></div>
            <p className="font-bold">Locations</p>
            <ul>
              {course.locations.map((location, index) => {
                const start_time = militaryToTime(location.start_time);
                const end_time = militaryToTime(location.end_time);
                return (
                  <li key={index} className="flex ">
                    -
                    <div className="ml-1">
                      {location.rooms.map((room, index) => {
                        if (room.building != undefined) {
                          return (
                            <span key={index}>
                              {room.building.name}, {room.room},{" "}
                            </span>
                          );
                        }
                        return null;
                      })}
                      {location.is_online ? "Online, " : ""}
                      {location.day_monday ? "M" : ""}
                      {location.day_tuesday ? "T" : ""}
                      {location.day_wednesday ? "W" : ""}
                      {location.day_thursday ? "R" : ""}
                      {location.day_friday ? "F" : ""}
                      {location.day_saturday ? " SAT" : ""}
                      {location.day_sunday ? " SUN" : ""}
                      <br />
                      <p>
                        {start_time.anteMeridiemHour}:
                        {start_time.minute < 10
                          ? "0" + start_time.minute
                          : start_time.minute}{" "}
                        {start_time.period} to {end_time.anteMeridiemHour}:
                        {end_time.minute < 10
                          ? "0" + end_time.minute
                          : end_time.minute}{" "}
                        {end_time.period}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {course == undefined && (
          <div className="text-center">
            <p>Hover over a course to view basic course information!</p>
          </div>
        )}
      </div>
    </>
  );
};

interface CourseInfoItemProps {
  title: string;
  value: string | number;
}

const CourseInfoItem = ({ title, value }: CourseInfoItemProps) => {
  return (
    <div className="flex w-full pr-5">
      <p className="grow font-bold">{title}</p>
      <p>{value}</p>
    </div>
  );
};

export default CourseInformationSidebar;
