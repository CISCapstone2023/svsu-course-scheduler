import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Button, ButtonGroup } from "react-daisyui";
import militaryToTime from "src/utils/time";
import { CaretDown, CaretUp, Mail } from "tabler-icons-react";

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
          is_online: boolean;
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
        subject: string;
        course_number: string;
        section: string;
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
        <strong
          className=" cursor-pointer "
          onClick={(isCaretDown) => setCaret((isCaretDown) => !isCaretDown)}
        >
          {faculty?.name}
        </strong>
        <div className="flex">
          <Button
            color="info"
            className="mr-2"
            onClick={() => {
              alert("mail");
            }}
          >
            <Mail />
          </Button>
          <span
            className="mr-3 cursor-pointer"
            onClick={(isCaretDown) => setCaret((isCaretDown) => !isCaretDown)}
          >
            with <strong>{faculty?.totalCredits}</strong> credits teaching in
          </span>

          {isCaretDown ? <CaretDown /> : <CaretUp />}
        </div>
      </div>

      {isCaretDown == false && (
        <div>
          {faculty?.to_courses.map((data, index) => {
            //Check if we have online courses
            const hasOnline = data.course.locations.some(
              (location) => location.is_online
            );

            //Check if we have in person courses
            const hasInPerson = data.course.locations.some(
              (location) => !location.is_online
            );
            let lecType = "ONL";
            //Check if they are hybrid
            if (hasInPerson && hasOnline) lecType = "HYB";
            else if (hasInPerson && !hasOnline) lecType = "LEC";
            else if (!hasInPerson && hasOnline) lecType = "ONL";
            return (
              <div
                className="border-neutral-900 container mx-auto mt-3 h-3/5 flex-col  rounded-lg border-2 border-opacity-50 bg-stone-50 p-4"
                key={index}
              >
                <div className="flex-col">
                  <strong>
                    {data.course.subject +
                      data.course.course_number +
                      "*" +
                      data.course.section}{" "}
                    - {data.course.credits} CREDITS - {lecType}{" "}
                  </strong>{" "}
                  <br />
                  <span>{data.course.title}</span>
                </div>

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
                            " FROM " +
                            militaryToTime(loc.start_time).hour +
                            ":" +
                            militaryToTime(loc.start_time).minute +
                            " " +
                            militaryToTime(loc.start_time).period +
                            " TO " +
                            militaryToTime(loc.end_time).hour +
                            ":" +
                            militaryToTime(loc.end_time).minute +
                            " " +
                            militaryToTime(loc.end_time).period}
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
