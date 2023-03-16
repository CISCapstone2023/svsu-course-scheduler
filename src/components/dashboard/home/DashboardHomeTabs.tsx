import React from "react";
import { Stats, Tabs, Table } from "react-daisyui";
import { api } from "src/utils/api";
//import Tab from "react-daisyui/dist/Tabs/Tab";

interface DashboardHomeTabsProps {
  children?: React.ReactNode;
  tuid: string;
}

const DashboardHomeTabs = ({ tuid }: DashboardHomeTabsProps) => {
  const [tabValue, setTabValue] = React.useState(0);

  const setCurrentTab = (value: number | null) => {
    if (value != null) {
      setTabValue(value);
    }
  };
  // const variables to gather the information from the backend api
  const totalCourses = api.home.getTotalCourses.useQuery({ tuid });
  const totalFaculty = api.home.getTotalFaculty.useQuery();
  const courses = api.home.getCoursesByState.useQuery({ tuid });

  // funtion to display courses in the correct tab
  function getCourses(tab: number) {
    if (tab == 0) {
      return courses.data?.result.addedCourses;
    }
    if (tab == 1) {
      return courses.data?.result.modifiedCourses;
    }
    if (tab == 2) {
      return courses.data?.result.removedCourses;
    }
  }
  console.log(courses);
  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-4 pt-10 font-bold">
        Welcome to the Course Scheduler and Visualizer
      </h1>
      {/* info card to display total numbers of courses currently intialized a schedule */}
      <div>
        <Stats className="mb-4 bg-base-200 shadow">
          <Stats.Stat>
            <div className="stat-title">Total Courses</div>
            <div className="stat-value">
              {totalCourses.data != undefined
                ? totalCourses.data.result.totalCourses
                : "0"}
            </div>
          </Stats.Stat>
        </Stats>
        {/* info card to display total numbers of faculty currently in a schedule */}
        <Stats className="ml-5 mb-4 bg-base-200 shadow">
          <Stats.Stat>
            <div className="stat-title">Total Faculty Members</div>
            <div className="stat-value">
              {totalFaculty.data != undefined
                ? totalFaculty.data.result.totalFaculty
                : "0"}
            </div>
          </Stats.Stat>
        </Stats>
      </div>
      {/* implements tabs to seperate added courses, modified courses and removed courses */}
      <div className="w-full">
        <Tabs
          className="w-full"
          variant="lifted"
          value={tabValue}
          onChange={setCurrentTab}
          size="lg"
        >
          <Tabs.Tab value={0}>Added</Tabs.Tab>
          <Tabs.Tab value={1}>Modified</Tabs.Tab>
          <Tabs.Tab value={2}>Removed</Tabs.Tab>
          <Tabs.Tab value={null} className="flex-1 cursor-default" />
        </Tabs>
        {/* displays table headers for course and faculty pagination */}
        <div className="overflow-x-auto border-x-[1px] border-b-[1px] border-gray-200 p-2">
          <Table className="w-full">
            <Table.Head>
              <span />
              <span>Faculty Member Name</span>
              <span>Course ID</span>
              <span>Course Title</span>
              <span>Location</span>
              <span>Start Time/ End Time</span>
            </Table.Head>

            <Table.Body>
              {/* this loop displays course and faculty data from backend */}
              {courses.data != undefined &&
                getCourses(tabValue)?.map((course, index) => {
                  return (
                    <Table.Row key={index}>
                      <span>{index}</span>
                      <span>{course.facultyNames}</span>
                      <span>{course.courseID}</span>
                      <span>{course.courseTitle}</span>
                      <span>{course.courseLocation}</span>
                      <span>{course.courseTimes}</span>
                    </Table.Row>
                  );
                })}
            </Table.Body>
          </Table>{" "}
          {/* this shows a message to alert the user that no courses have been added, modified or removed */}
          {courses.data != undefined && getCourses(tabValue)?.length == 0 && (
            <div className="flex h-32 items-center justify-center text-center text-lg font-semibold">
              This schedule currenlty has no courses that meets this criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHomeTabs;
