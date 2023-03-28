//Next and NextAuth
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Dropdown } from "react-daisyui";
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
import { type IScheduleCourseWithTimes } from "./calendar/CalendarCourseListing";

import Head from "next/head";

import {
  ArrowDown,
  ArrowUp,
  Check,
  FileExport,
  PencilPlus,
  Printer,
  X,
} from "tabler-icons-react";

//Type that defines the current NextJS page for use
interface ScheduleCalendar {
  scheduleId: string;
  name: string;
}

/**
 * Scheduler
 * The schedueler allows vieing, adding, updting, and removal (not-transactively) to the current revision.
 * Any changes will show in the current viewing of a calendar, which is a group of courses for said current
 * semester
 * @param scheduleId Identifier of the current schedudle revision
 * @returns
 */
const Scheduler: NextPage<ScheduleCalendar> = ({ scheduleId, name }) => {
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
   * @author Brendan Fuller, Saturn Gilbert
   */
  const removeScheduleCalendar = (index: number) => {
    //Grabs copy of revision tabs array
    const copyOfRevisionTabs = [...revisionTabs];

    //Splices copy (removes tab at index)
    copyOfRevisionTabs.splice(index, 1);

    //If statement checks to see if current tab is at end of revision tabs array
    if (currentReivisionTab == copyOfRevisionTabs.length) {
      //If so, set currently selected tab to previous tab in array
      setCurrentRevisionTab(copyOfRevisionTabs.length - 1);
    }

    //Set selected revision tab
    setSchedueleTab(copyOfRevisionTabs);
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

  useEffect(() => {
    currentRevisionSemesters.refetch();
  }, [openModifyCourseModal]);

  //The course tuid that will be currently edited
  const [courseToEdit, setCourseToEdit] = useState<string | null>(null);
  const [courseToCopy, setCourseToCopy] = useState<string | null>(null);

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
  const [showWeekends, setShowWeekends] = useState(false);
  return (
    <DashboardLayout>
      <Head>
        <title>
          {name.substring(0, 30)} | SVSU Course Scheduler | Calendar
        </title>
      </Head>
      <DashboardSidebar />
      <DashboardContent>
        <div className="flex h-full w-full flex-col">
          <DashboardContentHeader title="Scheduler">
            <div className="flex items-center space-x-2">
              <Dropdown className="z-[900]">
                <Button size="sm" color="info">
                  <Printer className="mr-2 inline" />
                  Print
                </Button>
                <Dropdown.Menu className="w-[300px]">
                  <Dropdown.Item
                    onClick={handleTopPrint}
                    className="border-b border-black"
                  >
                    <ArrowUp className="inline" />
                    <Printer className="inline" />
                    Print Top Calendar
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleBottomPrint}>
                    <ArrowDown className="inline" />
                    <Printer className="inline" />
                    Print Bottom Calendar
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Button onClick={exportCalendar} size="sm" color="success">
                <FileExport className="mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                color="warning"
                onClick={() => {
                  setModifyCourseModal(true);
                }}
              >
                <PencilPlus className="mr-2" />
                Add Course
              </Button>
              <ButtonGroup className="border-l-2 border-black pl-2">
                <Button
                  onClick={() => {
                    setShowWeekends(!showWeekends);
                  }}
                  size="sm"
                  active={showWeekends}
                >
                  {showWeekends && <Check />}
                  {!showWeekends && <X />} Show Weekends
                </Button>
                <Button
                  active={courseInformationSidebar}
                  size="sm"
                  onClick={() => {
                    toggleCourseInformationSidebar(!courseInformationSidebar);
                  }}
                >
                  {courseInformationSidebar && <Check />}
                  {!courseInformationSidebar && <X />} Basic Course Info?
                </Button>
              </ButtonGroup>
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
                name={""}
                ref={calendarRef}
                update={openModifyCourseModal}
                onSelect={(value) => {
                  setCourseToEdit(value);
                  setModifyCourseModal(true);
                }}
                onCopy={(value) => {
                  setCourseToCopy(value);
                  setCourseToEdit(null);
                  setModifyCourseModal(true);
                }}
                semester={
                  currentRevisionSemesters.data[currentSemesterTabs]!.semester
                }
                revision={scheduleId}
                weekends={showWeekends}
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
                closable={true}
                tabs={revisionTabs}
                active={currentReivisionTab}
                onClose={(tab) => {
                  removeScheduleCalendar(tab);
                }}
                onSelect={(tab) => {
                  // console.log(tab);
                  setCurrentRevisionTab(tab);
                }}
                showChildren={true}
              >
                <Select
                  menuPlacement="top"
                  options={revisionList.data as IRevisionSelect[]}
                  value={selectedRevision}
                  classNamePrefix="selection"
                  className="z-[500] w-[200px]"
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
              {revisionTabs.map((tab, index) => {
                if (index == currentReivisionTab) {
                  return (
                    <ScheduleCalendarPrintable
                      key={index}
                      ref={calendarBottomRef}
                      name={revisionTabs[currentReivisionTab]!.title}
                      locked={true}
                      onSelect={(value) => {
                        //do nothing
                      }}
                      onCopy={(value) => {
                        setCourseToCopy(value);
                        setCourseToEdit(null);
                        setModifyCourseModal(true);
                      }}
                      semester={revisionTabs[currentReivisionTab]!.semester}
                      revision={revisionTabs[currentReivisionTab]!.revision}
                      weekends={false}
                      onCourseHover={setLastHoveredCourse}
                    />
                  );
                }

                return null;
              })}
            </>
          )}
        </div>
        {openModifyCourseModal && (
          <CreateCourseModal
            revisionTuid={scheduleId}
            open={openModifyCourseModal}
            edit={courseToEdit}
            copy={courseToCopy}
            onSuccess={() => {
              setModifyCourseModal(false);
            }}
            onClose={() => {
              setModifyCourseModal(false);
              setCourseToCopy(null);
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

    //Now get the revision and get the name so we can use it in the title
    const revision = await prisma.scheduleRevision.findFirst({
      where: {
        tuid: query.scheduleId as string,
        creator_tuid: session?.user?.id,
      },
      select: {
        name: true,
      },
    });

    //Get the user also so we can grab the departments for the filter automaitcally
    const user = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
      select: {
        department: true,
      },
    });

    return {
      props: {
        scheduleId,
        //Pass the name to the page
        name: revision!.name,
        //Pass department to the page
        department: user?.department,
      },
    };
  }
);
