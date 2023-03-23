import classNames from "classnames";
import { isEqual } from "lodash";
import React, { useEffect, useState } from "react";
import { Button, Dropdown } from "react-daisyui";
import AnimatedSpinner from "src/components/AnimatedSpinner";
import { type IScheduleCourse } from "src/server/api/routers/calendar";
import { api } from "src/utils/api";
import { Dots, DotsCircleHorizontal, Printer } from "tabler-icons-react";
import CourseListing, {
  IScheduleCourseWithTimes,
} from "./calendar/CalendarCourseListing";

import CalendarWeekdayHeader from "./calendar/CalendarWeekdayHeader";

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

const ScheduleCalendar = ({
  semester,
  weekends = false,
  update,
  revision,
  locked = false,
  onSelect,
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

  //HTML/JSX Rendering
  return (
    <div className="h-full overflow-hidden">
      <div className="flex h-7 flex-row justify-evenly">
        <div className="relative flex w-[70px] border-r border-b border-base-300">
          <Dropdown
            className="z-[1000]"
            style={{
              top: 0,
              left: 0,
            }}
          >
            <Dropdown.Item>
              <DotsCircleHorizontal className="inline" />
            </Dropdown.Item>
            <Dropdown.Menu className="w-52">
              <Dropdown.Item onClick={onPrint}>
                <Printer className="inline" />
                Print
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <div
            className="absolute  "
            style={{
              top: 0,
              left: 25,
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
            <CalendarWeekdayHeader weekday="Saturday" locked={locked} />
            <CalendarWeekdayHeader weekday="Sunday" locked={locked} />
          </>
        )}
      </div>
      <div className="flex h-full w-full overflow-y-scroll">
        <div
          className={classNames(
            { "bg-base-200": locked },
            "flex h-[900px] w-full flex-col border-l-2 border-base-100"
          )}
        >
          {result.data != undefined && (
            <div className="flex h-full flex-row justify-evenly">
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
                          <div className="justi -translate-y- flex h-4 w-full items-center   text-sm">
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
      <div className="h-full overflow-hidden">
        <div className="border-2 border-base-200 font-bold">
          {this.props.name}
        </div>
        <ScheduleCalendar {...this.props} />
      </div>
    );
  }
}
