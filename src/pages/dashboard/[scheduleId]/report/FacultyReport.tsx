import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Button, ButtonGroup } from "react-daisyui";
import { toast } from "react-toastify";
import { api } from "src/utils/api";
import militaryToTime from "src/utils/time";
import { CaretDown, CaretUp, Mail } from "tabler-icons-react";

interface FacultyReportProps {
  children?: React.ReactNode;
  scheduleId: string;
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
    email: string;
    totalCredits: number;
  };
}
/**
 * FacultyReport
 * Generates the main content report page for one professor
 * @Author Binh Dang
 */
const FacultyReport = ({
  children,
  faculty,
  scheduleId,
}: FacultyReportProps) => {
  //useState for caret Icon
  const [isCaretDown, setCaret] = useState(true);
  const exportMutation = api.projects.exportScheduleRevision.useMutation();

  const exportCalendar = async () => {
    const result = await exportMutation.mutateAsync({
      tuid: scheduleId,
    });

    if (result) {
      window.open("/api/revision/" + scheduleId + "/downloadReport", "_blank");
      toast.success("Please attatch the exported Excel sheet to the email! ", {
        position: "top-center",
      });
    } else {
      toast.error(
        "Could not export to excel. \n This is likely from an older revision, which is not supported. ",
        { position: "top-center" }
      );
    }
  };
  return (
    <div className="border-neutral-900 container mx-auto   flex-col  rounded-lg border-2 border-opacity-50 bg-stone-200 p-4">
      <div className="flex justify-between">
        <div className="flex">
          <Button
            color="info"
            size="sm"
            className="mr-2"
            onClick={() => {
              const nl = "%0D%0A";
              const space = "     ";
              let courses = "";
              //loop through the list of course of that profesor will be teaching in that revision
              faculty?.to_courses.map((data) => {
                //check if course exceed limit characters for mailto
                //if exceed just add in the line.
                if (courses.length > 1000) {
                  if (
                    !courses.includes(
                      "...Please review the attatched sheet for more detail."
                    )
                  )
                    courses +=
                      "...Please review the attatched sheet for more detail." +
                      nl +
                      nl;
                } else {
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

                  //print course location
                  let locations = "";
                  data.course.locations.map((loc) => {
                    {
                      locations += space + "- ";
                      loc.rooms.map((value) => {
                        locations += value.building.name + " " + value.room;
                      });
                      if (!loc.is_online) {
                        locations +=
                          //inline function add 0 in front when time less than 10
                          " from " +
                          (militaryToTime(loc.start_time).anteMeridiemHour < 10
                            ? "0" +
                              militaryToTime(
                                loc.start_time
                              ).anteMeridiemHour.toString()
                            : militaryToTime(loc.start_time).anteMeridiemHour) +
                          ":" +
                          (militaryToTime(loc.start_time).minute < 10
                            ? "0" +
                              militaryToTime(loc.start_time).minute.toString()
                            : militaryToTime(loc.start_time).minute) +
                          " " +
                          militaryToTime(loc.start_time).period +
                          " to " +
                          (militaryToTime(loc.end_time).anteMeridiemHour < 10
                            ? "0" +
                              militaryToTime(
                                loc.end_time
                              ).anteMeridiemHour.toString()
                            : militaryToTime(loc.end_time).anteMeridiemHour) +
                          ":" +
                          (militaryToTime(loc.end_time).minute < 10
                            ? "0" +
                              militaryToTime(loc.end_time).minute.toString()
                            : militaryToTime(loc.end_time).minute) +
                          " " +
                          militaryToTime(loc.end_time).period;
                      }
                    }

                    locations += " [ ";
                    if (loc.day_monday) locations += "MON ";
                    if (loc.day_tuesday) locations += "TUES ";
                    if (loc.day_wednesday) locations += "WED ";
                    if (loc.day_thursday) locations += "THURS ";
                    if (loc.day_friday) locations += "FRI ";
                    if (loc.day_saturday) locations += "SAT ";
                    if (loc.day_sunday) locations += "SUN ";

                    if (
                      !(
                        locations.includes("MON") ||
                        locations.includes("TUES") ||
                        locations.includes("WED") ||
                        locations.includes("THURS") ||
                        locations.includes("FRI") ||
                        locations.includes("SAT") ||
                        locations.includes("SUN")
                      ) &&
                      (lecType.includes("ONL") || lecType.includes("HYB"))
                    )
                      locations += "Online Location ";
                    locations += "]" + nl;
                  });

                  //combining all the information for individual course
                  courses +=
                    data.course.subject +
                    data.course.course_number +
                    "*" +
                    data.course.section +
                    " - " +
                    data.course.credits +
                    " CREDITS - " +
                    lecType +
                    nl +
                    data.course.title.replace("&", "AND").toUpperCase() +
                    nl +
                    locations +
                    nl;
                }
              });
              exportCalendar();
              window.location.href =
                "mailto:" +
                faculty?.email +
                "?subject=Proposed Calendar for Review&body=Hello " +
                faculty?.name +
                "," +
                nl +
                nl +
                "Here's the proposed schedule (see attatchment for more detail) with " +
                faculty?.totalCredits +
                " credits that you will be teaching. Here is the list:" +
                nl +
                nl +
                courses +
                "Please review and email back, " +
                nl +
                nl +
                "SVSU Course Scheduler";
            }}
          >
            <Mail />
          </Button>
          <strong
            className=" cursor-pointer "
            onClick={(isCaretDown) => setCaret((isCaretDown) => !isCaretDown)}
          >
            {faculty?.name}
          </strong>
        </div>

        <div
          className="flex cursor-pointer"
          onClick={(isCaretDown) => setCaret((isCaretDown) => !isCaretDown)}
        >
          <span className="mr-3 ">
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
                          • {}
                          {/* inline function add 0 in front when time less than 10 */}
                          {!loc.is_online
                            ? loc.rooms.map((value) => {
                                return value.building.name + " " + value.room;
                              }) +
                              " from " +
                              (militaryToTime(loc.start_time).anteMeridiemHour <
                              10
                                ? "0" +
                                  militaryToTime(
                                    loc.start_time
                                  ).anteMeridiemHour.toString()
                                : militaryToTime(loc.start_time)
                                    .anteMeridiemHour) +
                              ":" +
                              (militaryToTime(loc.start_time).minute < 10
                                ? "0" +
                                  militaryToTime(
                                    loc.start_time
                                  ).minute.toString()
                                : militaryToTime(loc.start_time).minute) +
                              " " +
                              militaryToTime(loc.start_time).period +
                              " to " +
                              (militaryToTime(loc.end_time).anteMeridiemHour <
                              10
                                ? "0" +
                                  militaryToTime(
                                    loc.end_time
                                  ).anteMeridiemHour.toString()
                                : militaryToTime(loc.end_time)
                                    .anteMeridiemHour) +
                              ":" +
                              (militaryToTime(loc.end_time).minute < 10
                                ? "0" +
                                  militaryToTime(loc.end_time).minute.toString()
                                : militaryToTime(loc.end_time).minute) +
                              " " +
                              militaryToTime(loc.end_time).period
                            : "Online Location"}
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
