import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { InfoCircle } from "tabler-icons-react";
import { Button } from "react-daisyui";
import Select from "react-select";

import { prisma } from "src/server/db";
import { routeNeedsAuthSession } from "src/server/auth";
import { api } from "src/utils/api";

import DashboardContent from "src/components/dashboard/DashboardContent";
import DashboardContentHeader from "src/components/dashboard/DashboardContentHeader";
import DashboardLayout from "src/components/dashboard/DashboardLayout";
import DashboardSidebar from "src/components/dashboard/DashboardSidebar";
import AnimatedSpinner from "src/components/AnimatedSpinner";
import { Tabs } from "./Tabs";

import ScheduleCalendar, { type IScheduleCourseWithTimes } from "./Calendar";
import {
  type IRevisionSelect,
  type ITab,
} from "src/server/api/routers/calendar";

interface ScheduleCalendar {
  scheduleId: string;
}

const Scheduler: NextPage<ScheduleCalendar> = ({ scheduleId }) => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */

  const { data } = useSession();

  /**
   * Tabs
   * Keep the state of the current tab
   */
  const [currentSemesterTabs, setCurrentSemesterTabValue] = useState(0);
  const currentRevisionSemesters = api.calendar.getSemestersByRevision.useQuery(
    {
      revision: scheduleId,
    }
  );

  const revisionList = api.calendar.getSemesters.useQuery();

  const [currentReivisionTab, setCurrentRevisionTab] = useState(0);
  const [revisionTabs, setSchedueleTab] = useState<ITab[]>([]);

  // useEffect(() => {
  //   setCurrentRevisionTab(revisionTabs.length - 1);
  // }, [revisionTabs]);

  /**
   * Add a schedule for a revision on the list of revision tabs
   * @param tab
   */
  const addSchedule = (tab: ITab) => {
    setSchedueleTab([...revisionTabs, tab]);
  };

  /**
   *
   * @param index
   */
  const removeSchedule = (index: number) => {
    setSchedueleTab(revisionTabs.splice(index, 1));
  };

  /**
   * Last Hovered Course
   * Sets the last hovered course to this value. Used for
   * passing down hover events to the calendars to sync
   */
  const [lastHovered, setLastHoveredCourse] =
    useState<IScheduleCourseWithTimes | null>();

  const [courseInformationSidebar, toggleCourseInformationSidebar] =
    useState<boolean>(false);

  const [selectedRevision, setSelectRevision] = useState<IRevisionSelect>();

  return (
    <DashboardLayout>
      <DashboardSidebar />
      <DashboardContent>
        <div className="flex h-full w-full flex-col">
          <DashboardContentHeader title="Scheduler">
            <Button
              active={courseInformationSidebar}
              size="sm"
              onClick={() => {
                toggleCourseInformationSidebar(!courseInformationSidebar);
              }}
            >
              <InfoCircle />
            </Button>
          </DashboardContentHeader>
          {currentRevisionSemesters.data != undefined && (
            <>
              <Tabs
                tabs={currentRevisionSemesters.data}
                active={currentSemesterTabs}
                onSelect={(tab) => {
                  console.log(tab);
                  setCurrentSemesterTabValue(tab);
                }}
              />
              <ScheduleCalendar
                onSelect={(value) => {
                  console.log(value);
                }}
                semester={
                  currentRevisionSemesters.data[currentSemesterTabs]!.semester
                }
                revision={scheduleId}
                weekends={false}
                onCourseHover={setLastHoveredCourse}
              />
            </>
          )}
          {/* Animated Spinner for making sure the application will load correctly */}
          {currentRevisionSemesters.data == undefined && (
            <div>
              <div className="flex h-[200px] w-full flex-col items-center justify-center">
                <AnimatedSpinner />
                <p>Loading...</p>
              </div>
            </div>
          )}
          {/* Make sure we have the list of revision data  */}
          {revisionList.data != undefined && (
            <>
              <Tabs
                tabs={revisionTabs}
                active={currentReivisionTab}
                onSelect={(tab) => {
                  console.log(tab);
                  setCurrentRevisionTab(tab);
                }}
                dropdown={true}
              >
                <Select
                  menuPlacement="top"
                  options={revisionList.data as IRevisionSelect[]}
                  value={selectedRevision}
                  classNamePrefix="selection"
                  onChange={(selectedRevision) => {
                    //Check to make sure the reivison won't be undefined
                    if (selectedRevision != undefined) {
                      setSelectRevision(selectedRevision);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedRevision != undefined) {
                      addSchedule(selectedRevision?.value);
                    }
                  }}
                >
                  Open
                </Button>
              </Tabs>
              {revisionTabs.length > 0 && (
                <ScheduleCalendar
                  onSelect={(value) => {
                    console.log(value);
                  }}
                  semester={revisionTabs[currentReivisionTab]!.semester}
                  revision={revisionTabs[currentReivisionTab]!.revision}
                  weekends={false}
                  onCourseHover={setLastHoveredCourse}
                />
              )}
            </>
          )}
        </div>
      </DashboardContent>
      {courseInformationSidebar && (
        <div className="flex h-full w-[220px] flex-col bg-base-200 pt-4">
          {lastHovered?.title}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Scheduler;

/**
 * Get Server Side Properties
 *
 * NextJS supports a custom callback, so before a page is returned to the client
 * you can check on the backend, this allows for us to check if the user is
 * authenticated for example.
 *
 * So with this code we wrap the "routeNeedsAuthSession" so the user needs to
 * be signed in for this page to be shown, if its not that function will redirect the
 * user back to the "/" home sign-up page.
 *
 * Also the perk of server props is that it occurs at page load time.
 * Meaning any data we pass into the "props" return object, will be provided
 * as a prop to the "NextPage" below. So for example the {} of the props could
 * contain data which could be used.
 *
 */

export const getServerSideProps = routeNeedsAuthSession(async ({ query }) => {
  const scheduleId = query.scheduleId || "";

  if (typeof scheduleId === "string") {
    const hasRevision =
      (await prisma.scheduleRevision.count({
        where: {
          tuid: query.scheduleId as string,
        },
      })) == 1;

    if (false) {
      return {
        redirect: {
          destination: "/projects", //Path to the Login Screen
          permanent: false,
        },
      };
    }
  }

  //NOTE: Passing the entire session to the NextPage will error,
  //which is likely due to undefined values.
  //Ideally just hook with "useSession" in the page
  return {
    props: {
      scheduleId,
    },
  };
});
