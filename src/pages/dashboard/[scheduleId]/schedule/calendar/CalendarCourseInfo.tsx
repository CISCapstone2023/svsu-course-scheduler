import classNames from "classnames";
import { Lock } from "tabler-icons-react";
import { IScheduleCourseWithTimes } from "./CalendarCourseListing";

interface CalendarCourseInfoProps {
  locked?: boolean;
  course: IScheduleCourseWithTimes;
  online?: boolean;
}

const CalendarCourseInfo = ({
  locked,
  course,
  online = false,
}: CalendarCourseInfoProps) => {
  return (
    <>
      {course != undefined && (
        <div
          className={classNames("flex h-full w-full p-1", {
            "bg-red-100": !online && !course.withinGuideline,
          })}
        >
          <p style={{ fontSize: 12 }}>
            <p className="text-md font-bold">
              {course.subject} - {course.course_number} - {course.section}
            </p>{" "}
            {course.title}
          </p>
          {locked && <Lock className="inline" width={20} height={20} />}
        </div>
      )}
    </>
  );
};

export default CalendarCourseInfo;
