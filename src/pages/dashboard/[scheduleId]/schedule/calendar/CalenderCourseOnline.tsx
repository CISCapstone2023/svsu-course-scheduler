import classNames from "classnames";
import { MouseEvent } from "react";
import { IScheduleCourse } from "src/server/api/routers/calendar";
import CalendarCourseInfo from "./CalendarCourseInfo";
import { IScheduleCourseWithTimes } from "./CalendarCourseListing";

interface CalendarCourseOnlineProps {
  show: boolean; //Do we show the courses
  locked?: boolean; //Do we tell the user this is in lcoked mode
  courses: IScheduleCourseWithTimes[];
  overlap?: boolean; //Do we want to overlap courses in this mode?
  setCourseHover: (value: IScheduleCourseWithTimes | null) => void; //Hover event
  onContext: (value: string, e: MouseEvent<HTMLDivElement>) => void;
  onSelect: (value: string) => void; //Selection event
  hover: IScheduleCourseWithTimes | null; //Hover data?
}

const CalendarCourseOnline = ({
  show,
  locked,
  courses,
  onContext,
  overlap,
  setCourseHover,
  onSelect,
  hover,
}: CalendarCourseOnlineProps) => {
  if (courses != undefined) {
    return (
      <>
        {courses.map((course, index) => {
          return (
            <div
              key={index + course.tuid}
              onMouseEnter={() => setCourseHover(course)}
              onMouseLeave={() => setCourseHover(null)}
              tabIndex={index}
              onClick={() => {
                onSelect(course.tuid);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                onContext(course.tuid, e);
              }}
              className={classNames(
                "z-[100] m-1 flex w-32 cursor-pointer overflow-hidden text-ellipsis rounded-lg border border-base-100 bg-base-200 transition-all duration-150 hover:z-[500] hover:shadow-lg",
                {
                  "-ml-10": index > 0 && overlap,
                  "z-[999] shadow-lg":
                    hover != null && hover.tuid == course.tuid,
                  "bg-base-300":
                    hover != null &&
                    hover.tuid == course.tuid &&
                    course.withinGuideline,

                  //Check the state
                  "border-[3px] border-green-400": course.state == "ADDED",
                  "border-[3px] border-yellow-400": course.state == "MODIFIED",
                  "border-[3px] border-red-400": course.state == "REMOVED",
                }
              )}
            >
              <CalendarCourseInfo
                locked={locked}
                course={course as any}
                online={true}
              />
            </div>
          );
        })}
      </>
    );
  }
  return <div></div>;
};

export default CalendarCourseOnline;
