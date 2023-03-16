import React, { useState } from "react";
import { Button, ButtonGroup } from "react-daisyui";
import { CaretDown, CaretUp } from "tabler-icons-react";

interface FacultyReportProps {
  children?: React.ReactNode;
  faculty?: {
    to_courses: {
      course: {
        title: string;
        revision: {
          tuid: string;
        };
        locations: {
          start_time: number;
          end_time: number;
          rooms: {
            room: string;
            building: {
              name: string;
              campus: {
                name: string;
              };
            };
          }[];
          day_monday: boolean;
          day_tuesday: boolean;
          day_wednesday: boolean;
          day_thursday: boolean;
          day_friday: boolean;
          day_saturday: boolean;
          day_sunday: boolean;
        }[];
        semester_summer: boolean;
        semester_fall: boolean;
        semester_winter: boolean;
        semester_spring: boolean;
        instruction_method: string;
        credits: number;
      };
    }[];
    name: string;
    totalCredits: number;
  };
}

const FacultyReport = ({ children, faculty }: FacultyReportProps) => {
  //useState for caret Icon
  const [isCaretDown, setCaret] = useState(true);
  return (
    <div className="border-neutral-900 container mx-auto   flex-col  rounded-lg border-2 border-opacity-50 bg-stone-200 p-4">
      <div className="flex justify-between">
        <strong>{faculty?.name}</strong>
        <div className="flex">
          <span className="mr-3">
            with <strong>{faculty?.totalCredits}</strong> credits teaching in
          </span>

          {isCaretDown ? (
            <CaretDown
              onClick={(isCaretDown) => setCaret((isCaretDown) => !isCaretDown)}
            />
          ) : (
            <CaretUp
              onClick={(isCaretDown) => setCaret((isCaretDown) => !isCaretDown)}
            />
          )}
        </div>
      </div>

      {isCaretDown == false && (
        <div>
          {faculty?.to_courses.map((data, index) => {
            return (
              <div
                className="border-neutral-900 container mx-auto mt-3 h-3/5 flex-col  rounded-lg border-2 border-opacity-50 bg-stone-50 p-4"
                key={index}
              >
                <strong>
                  {data.course.title} - {data.course.credits} CREDITS -{" "}
                  {data.course.instruction_method}
                </strong>

                <div className="ml-10 mt-3 flex-col">
                  {data.course.locations.map((loc, index) => {
                    return (
                      <div
                        className="jus m-3 w-full justify-center"
                        key={index}
                      >
                        <span className="grow">
                          •{" "}
                          {loc.rooms.map((value) => {
                            return value.building.name + " " + value.room;
                          }) +
                            " @ " +
                            loc.start_time +
                            " to " +
                            loc.end_time}
                        </span>
                        <ButtonGroup className="inset-y-0 right-0  ml-5 ">
                          <Button size="xs" active={loc.day_monday}>
                            M
                          </Button>
                          <Button size="xs" active={loc.day_tuesday}>
                            T
                          </Button>
                          <Button size="xs" active={loc.day_wednesday}>
                            W
                          </Button>
                          <Button size="xs" active={loc.day_thursday}>
                            TH
                          </Button>
                          <Button size="xs" active={loc.day_friday}>
                            F
                          </Button>
                          <Button size="xs" active={loc.day_saturday}>
                            SAT
                          </Button>
                          <Button size="xs" active={loc.day_sunday}>
                            SUN
                          </Button>
                        </ButtonGroup>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FacultyReport;
