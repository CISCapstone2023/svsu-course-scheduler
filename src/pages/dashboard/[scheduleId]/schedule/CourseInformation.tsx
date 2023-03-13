import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { IScheduleCourseWithTimes } from "./Calendar";

interface CourseInformationSidebarProps {
  children?: React.ReactNode;
  course: IScheduleCourseWithTimes | null;
}

const CourseInformationSidebar = ({
  children,
  course,
}: CourseInformationSidebarProps) => {
  const [courseInformationSidebar, toggleCourseInformationSidebar] =
    useLocalStorage<boolean>("schedule/course/info", true);

  return (
    <>
      {courseInformationSidebar && (
        <div className="flex h-full w-[220px] flex-col bg-base-200 pt-4">
          {course?.title}
        </div>
      )}
    </>
  );
};

export default CourseInformationSidebar;
