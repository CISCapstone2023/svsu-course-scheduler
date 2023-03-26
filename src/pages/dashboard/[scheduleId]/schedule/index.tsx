//Next and NextAuth
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button, Toggle } from "react-daisyui";
import Select from "react-select";
import { useReactToPrint } from "react-to-print";
//Database and authentiation
import { prisma } from "src/server/db";
import { routeNeedsAuthSession } from "src/server/auth";
import { api } from "src/utils/api";

//Databhaord, spinners, and tabs
import DashboardContent from "src/components/dashboard/DashboardContent";
import DashboardContentHeader from "src/components/dashboard/DashboardContentHeader";
import DashboardLayout from "src/components/dashboard/DashboardLayout";
import DashboardSidebar from "src/components/dashboard/DashboardSidebar";
import AnimatedSpinner from "src/components/AnimatedSpinner";
import Tabs from "./Tabs";

//Local components and types
import ScheduleCalendar, { ScheduleCalendarPrintable } from "./Calendar";
import {
  type IRevisionSelect,
  type ITab,
} from "src/server/api/routers/calendar";
import CreateCourseModal from "./CourseModifyModal";
import CourseInformationSidebar from "./CourseInformation";
import { toast } from "react-toastify";
import { IScheduleCourseWithTimes } from "./calendar/CalendarCourseListing";

//Type that defines the current NextJS page for use
interface ScheduleCalendar {
  scheduleId: string;
}

/**
 * Scheduler
 * The schedueler allows vieing, adding, updting, and removal (not-transactively) to the current revision.
 * Any changes will show in the current viewing of a calendar, which is a group of courses for said current
 * semester
 * @param scheduleId Identifier of the current schedudle revision
 * @returns
 */
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

  //Get the possible semesters for the current revision we are editing
  const currentRevisionSemesters = api.calendar.getSemestersByRevision.useQuery(
    {
      revision: scheduleId,
    }
  );

  //The list of revisions for the selection on the bottom calendar poration
  const revisionList = api.calendar.getSemesters.useQuery();

  //The current reivison (bottom) tab
  const [currentReivisionTab, setCurrentRevisionTab] = useState(0);
  //The current list of tabs (bottom)
  const [revisionTabs, setSchedueleTab] = useState<ITab[]>([]);

  // useEffect(() => {
  //   setCurrentRevisionTab(revisionTabs.length - 1);
  // }, [revisionTabs]);

  /**
   * Add a calendar for a revision
   * @param tab
   * @author Brendan Fuller
   */
  const addScheduleCalendar = (tab: ITab) => {
    setSchedueleTab([...revisionTabs, tab]);
  };

  /**
   * Remove a calendar for a revision
   * @param index
   * @author Brendan Fuller
   */
  const removeScheduleCalendar = (index: number) => {
    setSchedueleTab(revisionTabs.splice(index, 1));
  };

  /**
   * Last Hovered Course
   * Sets the last hovered course to this value. Used for
   * passing down hover events to the calendars to sync
   */
  const [lastHovered, setLastHoveredCourse] =
    useState<IScheduleCourseWithTimes | null>();

  /**
   * Information Sidebar State
   * Boolean state for the right sidebar to toggle course infomation
   * based who is hovering the data
   * @author Brendan Fuller
   */
  const [courseInformationSidebar, setCourseInformationSidebar] =
    useState<boolean>(false);

  const toggleCourseInformationSidebar = (state: boolean) => {
    setCourseInformationSidebar(state);
    localStorage.setItem("schedule/sidebar", state ? "true" : "false");
  };

  useEffect(() => {
    const value = localStorage.getItem("schedule/sidebar");
    setCourseInformationSidebar(value == "true");
  }, []);

  //The revision which is selected for the tabs at the bottom
  const [selectedRevision, setSelectRevision] = useState<IRevisionSelect>();

  //The state of the course modal
  const [openModifyCourseModal, setModifyCourseModal] = useState(false);

  //The course tuid that will be currently edited
  const [courseToEdit, setCourseToEdit] = useState<string | null>(null);

  const exportMutation = api.projects.exportScheduleRevision.useMutation();

  const exportCalendar = async () => {
    const result = await exportMutation.mutateAsync({
      tuid: scheduleId,
    });
    if (result) {
      window.open("/api/revision/" + scheduleId + "/downloadReport", "_blank");
    } else {
      toast.error(
        "Could not export to excel. \n This is likely from an older revision, which is not supported. ",
        { position: "top-center" }
      );
    }
  };
  const calendarRef = useRef(null);
  const handleTopPrint = useReactToPrint({
    content: () => calendarRef.current,
  });

  const calendarBottomRef = useRef(null);
  const handleBottomPrint = useReactToPrint({
    content: () => calendarBottomRef.current,
  });

  return (
    <DashboardLayout>
      <DashboardSidebar />
      <DashboardContent>
        <div className="flex h-full w-full flex-col">
          <DashboardContentHeader title="Scheduler">
            <div className="flex items-center space-x-2">
              <Button onClick={exportCalendar} size="sm" color="success">
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setCourseToEdit(null);
                  setModifyCourseModal(true);
                }}
              >
                Add Course
              </Button>
              <p>Basic Course Info?</p>
              <Toggle
                className="ml-2"
                checked={courseInformationSidebar}
                size="sm"
                onClick={() => {
                  toggleCourseInformationSidebar(!courseInformationSidebar);
                }}
              />
            </div>
          </DashboardContentHeader>
          {currentRevisionSemesters.data != undefined && (
            <>
              <Tabs
                onClose={() => {
                  //hello
                }}
                tabs={currentRevisionSemesters.data}
                active={currentSemesterTabs}
                onSelect={(tab) => {
                  setCurrentSemesterTabValue(tab);
                }}
              />

              <ScheduleCalendarPrintable
                name={currentRevisionSemesters.data[currentReivisionTab]!.name!}
                ref={calendarRef}
                update={openModifyCourseModal}
                onSelect={(value) => {
                  setCourseToEdit(value);
                  setModifyCourseModal(true);
                }}
                onPrint={() => {
                  handleTopPrint();
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
                closable={false}
                tabs={revisionTabs}
                active={currentReivisionTab}
                onClose={(tab) => {
                  removeScheduleCalendar(tab);
                }}
                onSelect={(tab) => {
                  console.log(tab);
                  setCurrentRevisionTab(tab);
                }}
                showChildren={true}
              >
                <Select
                  menuPlacement="top"
                  options={revisionList.data as IRevisionSelect[]}
                  value={selectedRevision}
                  classNamePrefix="selection"
                  className="z-[1000]"
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
                      addScheduleCalendar(selectedRevision?.value);
                    }
                  }}
                >
                  Open
                </Button>
              </Tabs>
              {revisionTabs.length > 0 &&
                revisionTabs[currentReivisionTab] != undefined && (
                  <ScheduleCalendarPrintable
                    ref={calendarBottomRef}
                    name={revisionTabs[currentReivisionTab]!.title}
                    locked={true}
                    onSelect={(value) => {
                      console.log(value);
                    }}
                    onPrint={() => {
                      handleBottomPrint();
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
        {openModifyCourseModal && (
          <CreateCourseModal
            revisionTuid={scheduleId}
            open={openModifyCourseModal}
            edit={courseToEdit}
            onSuccess={() => {
              setModifyCourseModal(false);
            }}
            onClose={() => {
              setModifyCourseModal(false);
            }}
          />
        )}
      </DashboardContent>
      {courseInformationSidebar && (
        <CourseInformationSidebar course={lastHovered} />
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

export const getServerSideProps = routeNeedsAuthSession(
  async ({ query }, session) => {
    //Grab schedule id from query parameter
    const scheduleId = query.scheduleId || "";

    //Check to make sure its a string
    if (typeof scheduleId === "string") {
      //Make sure we have owenrship of said revision
      const hasRevision =
        (await prisma.scheduleRevision.count({
          where: {
            tuid: query.scheduleId as string,
            creator_tuid: session?.user?.id,
          },
        })) == 1;

      //And if we DO NOT, redirect them back to the main page
      if (!hasRevision) {
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
  }
);
