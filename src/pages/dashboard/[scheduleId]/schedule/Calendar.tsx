import classNames from "classnames";
import { isEqual } from "lodash";
import React, { MouseEvent, useEffect, useState } from "react";
import { Button, Dropdown } from "react-daisyui";
import AnimatedSpinner from "src/components/AnimatedSpinner";
import { type IScheduleCourse } from "src/server/api/routers/calendar";
import { api } from "src/utils/api";
import {
  Copy,
  Dots,
  DotsCircleHorizontal,
  Printer,
  Trash,
} from "tabler-icons-react";
import CourseListing, {
  IScheduleCourseWithTimes,
} from "./calendar/CalendarCourseListing";
import {
  Menu,
  Item,
  Separator,
  Submenu,
  useContextMenu,
} from "react-contexify";

import CalendarWeekdayHeader from "./calendar/CalendarWeekdayHeader";
import CalendarCourseOnline from "./calendar/CalenderCourseOnline";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";

/**
 * CalendarComponentProps
 *
 * Properties for the calendar
 *
 */
interface CalendarComponentProps {
  children?: React.ReactNode;
  semester: "FA" | "WI" | "SP" | "SU"; //What semsester is this calendar?
  revision: string; //What revision tuid is this calendar?
  update?: boolean; //Do we want to refetch this calendar? (true or false both update when toggled)
  weekends: boolean; //List of possible weekends to show
  locked?: boolean; //Is this calendar view locked?
  onSelect?: (course: string) => void; //Event when an course is selected
  onCopy?: (value: string | null) => void;
  onCourseHover?: (course: IScheduleCourseWithTimes) => void; //Eent when the mouse hovers over a course
  onPrint?: () => void;
}

interface Days {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

const MENU_ID = "calendar-menu";

const ScheduleCalendar = ({
  semester,
  weekends = false,
  update,
  revision,
  locked = false,
  onSelect,
  onCopy,
  onCourseHover,
  onPrint,
}: CalendarComponentProps) => {
  //Hover state of the current scheduler
  const [hover, setCourseHover] = useState<IScheduleCourseWithTimes | null>(
    null
  );

  //Update check, but passing in depdency to update on the prop change,
  //this will call refetch on the query bekow
  useEffect(() => {
    result.refetch();
  }, [update]);

  //The query if data based on the semester passed in
  const result = api.calendar.getRevision.useQuery({
    tuid: revision,
    maxRoomNum: "4",
    minRoomNum: "0",
    semester_fall: semester == "FA",
    semester_winter: semester == "WI",
    semester_summer: semester == "SU",
    semester_spring: semester == "SP",
  });
  //useState for deleteID course
  const [DeleteConfirmation, setConfirmation] = useState(false);
  const [DeleteID, setDeleteID] = useState("");
  const forceDeleteCourse = api.courses.forceDeleteCourse.useMutation();
  //delete revision
  const DeleteACourse = async (DeletedTuid: string) => {
    try {
      const response = await forceDeleteCourse.mutateAsync({
        tuid: DeletedTuid,
      });

      //If its true, that's a good!
      if (response) {
        toast.success(`Succesfully Remove Course`, {
          position: toast.POSITION.TOP_RIGHT,
        });
        result.refetch();
        //Else its an error
      } else {
        toast.error(`Failed to Remove Course`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
      result.refetch();
    } catch (error) {
      // handle error
      toast.error(`Failed to Connect Database`, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const [sections, setOpenSections] = useState<Days>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  //List of possible times
  const times = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
  ];

  const updateSectionViews = (days: Days) => {
    if (isEqual(days, sections)) {
      setOpenSections({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      });
    } else {
      setOpenSections(days);
    }
  };
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const [contextCourse, setContextCourse] = useState<string | null>(null);

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    show({
      event,
      props: {
        key: "value",
      },
    });
  };

  //HTML/JSX Rendering
  return (
    <div className="h-full overflow-hidden">
      <Menu id={MENU_ID} className="z-[900]">
        <Item
          id="copy"
          onClick={({ id, event, props }) => {
            if (onCopy != undefined) {
              onCopy(contextCourse);
            }
          }}
        >
          <Copy className="mr-2 text-orange-300" /> Copy Course
        </Item>
        <Separator />
        <Item
          id="copy"
          className="text-red-400"
          onClick={({ id, event, props }) => {
            if (contextCourse != undefined) {
              setDeleteID(contextCourse);
              setConfirmation(true);
            }
          }}
        >
          <Trash className="mr-2 text-red-400" /> Force Delete
        </Item>
      </Menu>
      <ConfirmDeleteModal
        open={DeleteConfirmation}
        title="Force Delete Confirmation"
        message="Are you sure to remove this course permanently?"
        onConfirm={() => {
          DeleteACourse(DeleteID);
          setConfirmation(false);
        }}
        onClose={() => {
          setDeleteID("");
          setConfirmation(false);
        }}
      ></ConfirmDeleteModal>
      {result.data && result.data.online.length > 0 && (
        <>
          <p className="-2 font-bold">Asynchronous Online Courses</p>
          <div className="flex h-[100px] flex-wrap overflow-y-scroll border-b-2 bg-white p-2">
            {result.data && (
              <CalendarCourseOnline
                locked={locked}
                show={true}
                onSelect={(course) => {
                  if (onSelect != undefined) onSelect(course);
                }}
                onContext={(course, e) => {
                  setContextCourse(course);
                  handleContextMenu(e);
                }}
                courses={result.data!.online}
                setCourseHover={(course) => {
                  setCourseHover(course);
                  if (onCourseHover != undefined) onCourseHover(course!);
                }}
                hover={hover}
              />
              // <></>
            )}
          </div>
        </>
      )}
      <div className="flex h-7 flex-row justify-evenly">
        <div className="relative flex w-[70px] border-r border-b border-base-300">
          <div
            className="absolute  "
            style={{
              top: 0,
              left: 2,
            }}
          >
            Time
          </div>
        </div>
        <CalendarWeekdayHeader
          locked={locked}
          weekday="Monday"
          active={sections.monday}
          onClick={() => {
            updateSectionViews({
              monday: true,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false,
            });
          }}
        />
        <CalendarWeekdayHeader
          locked={locked}
          weekday="Tuesday"
          active={sections.tuesday}
          onClick={() => {
            updateSectionViews({
              monday: false,
              tuesday: true,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false,
            });
          }}
        />
        <CalendarWeekdayHeader
          locked={locked}
          weekday="Wednesday"
          active={sections.wednesday}
          onClick={() => {
            updateSectionViews({
              monday: false,
              tuesday: false,
              wednesday: true,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false,
            });
          }}
        />
        <CalendarWeekdayHeader
          locked={locked}
          weekday="Thursday"
          active={sections.thursday}
          onClick={() => {
            updateSectionViews({
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: true,
              friday: false,
              saturday: false,
              sunday: false,
            });
          }}
        />
        <CalendarWeekdayHeader
          locked={locked}
          weekday="Friday"
          active={sections.friday}
          onClick={() => {
            updateSectionViews({
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: true,
              saturday: false,
              sunday: false,
            });
          }}
        />

        {weekends && (
          <>
            <CalendarWeekdayHeader
              weekday="Saturday"
              active={sections.saturday}
              onClick={() => {
                updateSectionViews({
                  monday: false,
                  tuesday: false,
                  wednesday: false,
                  thursday: false,
                  friday: false,
                  saturday: true,
                  sunday: false,
                });
              }}
            />
            <CalendarWeekdayHeader
              weekday="Sunday"
              active={sections.sunday}
              onClick={() => {
                updateSectionViews({
                  monday: false,
                  tuesday: false,
                  wednesday: false,
                  thursday: false,
                  friday: false,
                  saturday: false,
                  sunday: true,
                });
              }}
            />
          </>
        )}
      </div>
      <div className="flex h-full w-full overflow-y-scroll">
        <div
          id="course-root"
          className={classNames(
            { "bg-base-200": locked },
            "flex h-[900px] w-full flex-col "
          )}
        >
          {result.data != undefined && (
            <>
              <div className="flex h-full flex-row justify-evenly  ">
                <div className="wrap relative flex h-full w-[70px]  border-r border-base-300">
                  <div className="relative grow basis-0  ">
                    {times.map(function (x, i) {
                      return (
                        <div
                          key={i}
                          className="absolute w-full pl-1"
                          style={{
                            top: i * 60,
                            left: 0,
                          }}
                        >
                          <div key={i} className="flex flex-row text-center">
                            <div className="justi flex h-4 w-full -translate-y-1 items-center   text-sm">
                              {x}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {times.map(function (_x, i) {
                      return (
                        <div
                          key={i}
                          className="absolute w-full "
                          style={{
                            top: i * 60 + 34,
                            left: 0,
                          }}
                        >
                          <div key={i} className="flex flex-row text-center">
                            <div className=" flex  w-full items-center border-b border-base-300 bg-base-200  text-sm"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <CourseListing
                  locked={locked}
                  show={sections.monday}
                  onSelect={(course) => {
                    if (onSelect != undefined) onSelect(course);
                  }}
                  onContext={(course, e) => {
                    setContextCourse(course);
                    handleContextMenu(e);
                  }}
                  courses={result.data.monday_courses}
                  setCourseHover={(course) => {
                    setCourseHover(course);
                    if (onCourseHover != undefined) onCourseHover(course!);
                  }}
                  hover={hover}
                />
                <CourseListing
                  locked={locked}
                  show={sections.tuesday}
                  onSelect={(course) => {
                    if (onSelect != undefined) onSelect(course);
                  }}
                  onContext={(course, e) => {
                    setContextCourse(course);
                    handleContextMenu(e);
                  }}
                  courses={result.data.tuesday_courses}
                  setCourseHover={(course) => {
                    setCourseHover(course);
                    if (onCourseHover != undefined) onCourseHover(course!);
                  }}
                  hover={hover}
                />
                <CourseListing
                  locked={locked}
                  show={sections.wednesday}
                  onSelect={(course) => {
                    if (onSelect != undefined) onSelect(course);
                  }}
                  onContext={(course, e) => {
                    setContextCourse(course);
                    handleContextMenu(e);
                  }}
                  courses={result.data.wednesday_courses}
                  setCourseHover={(course) => {
                    setCourseHover(course);
                    if (onCourseHover != undefined) onCourseHover(course!);
                  }}
                  hover={hover}
                />
                <CourseListing
                  locked={locked}
                  show={sections.thursday}
                  onSelect={(course) => {
                    if (onSelect != undefined) onSelect(course);
                  }}
                  onContext={(course, e) => {
                    setContextCourse(course);
                    handleContextMenu(e);
                  }}
                  courses={result.data.thursday_courses}
                  setCourseHover={(course) => {
                    setCourseHover(course);
                    if (onCourseHover != undefined) onCourseHover(course!);
                  }}
                  hover={hover}
                />
                <CourseListing
                  locked={locked}
                  show={sections.friday}
                  onSelect={(course) => {
                    if (onSelect != undefined) onSelect(course);
                  }}
                  onContext={(course, e) => {
                    setContextCourse(course);
                    handleContextMenu(e);
                  }}
                  courses={result.data.friday_courses}
                  setCourseHover={(course) => {
                    setCourseHover(course);
                    if (onCourseHover != undefined) onCourseHover(course!);
                  }}
                  hover={hover}
                />
                {/*Do we want to show the weekends? */}
                {weekends && (
                  <>
                    <CourseListing
                      locked={locked}
                      show={sections.saturday}
                      onSelect={(course) => {
                        if (onSelect != undefined) onSelect(course);
                      }}
                      onContext={(course, e) => {
                        setContextCourse(course);
                        handleContextMenu(e);
                      }}
                      courses={result.data.saturday_courses}
                      setCourseHover={(course) => {
                        setCourseHover(course);
                        if (onCourseHover != undefined) onCourseHover(course!);
                      }}
                      hover={hover}
                    />
                    <CourseListing
                      locked={locked}
                      show={sections.sunday}
                      onSelect={(course) => {
                        if (onSelect != undefined) onSelect(course!);
                      }}
                      onContext={(course, e) => {
                        setContextCourse(course);
                        handleContextMenu(e);
                      }}
                      courses={result.data.sunday_courses}
                      setCourseHover={(course) => {
                        setCourseHover(course);
                        if (onCourseHover != undefined) onCourseHover(course!);
                      }}
                      hover={hover}
                    />
                  </>
                )}
              </div>
            </>
          )}
          {/* Make a spinner show if we have no calendar data loaded */}
          {result.data == undefined && (
            <div className="flex h-[200px] w-full flex-col items-center justify-center">
              <AnimatedSpinner />
              <p>Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ScheduleCalendar);

// eslint-disable-next-line react/display-name
export class ScheduleCalendarPrintable extends React.PureComponent<
  CalendarComponentProps & { name: string }
> {
  render() {
    return (
      <div className="flex h-full flex-col overflow-hidden" id="course-main">
        <div className="border-2 border-base-200 font-bold">
          {this.props.name}
        </div>
        <ScheduleCalendar {...this.props} />
      </div>
    );
  }
}
