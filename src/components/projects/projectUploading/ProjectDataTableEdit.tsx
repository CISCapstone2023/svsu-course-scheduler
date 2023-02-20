import { findKey } from "lodash";
import React, { useState } from "react";
import { Select, Table } from "react-daisyui";

import { AlertTriangle, NoteOff } from "tabler-icons-react";

interface ProjectDataTableEditProps {
  uploaded: Array<Array<string>> | undefined;
  handleInputChange: (column: number, title: string) => void;
}
interface DataFormat {
  id: string;
  name: string;
}
let preSet: Record<number, string> = [];
let preSetFlag = true;
const MAXIMUM_COLUMNS = 30;

if (preSetFlag) {
  for (let i = 0; i < MAXIMUM_COLUMNS; i++) {
    preSet = { ...preSet, [i]: "default" };
  }
  preSetFlag = false;
}

const ProjectDataTableEdit = ({ uploaded }: ProjectDataTableEditProps) => {
  const [organize, setOrganize] = useState<Record<string, number | null>>({
    noteWhatHasChanged: 0,
    section_id: 1,
    term: 2,
    div: 3,
    department: 4,
    subject: 5,
    course_number: 6,
    section: 7,
    title: 8,
    instruction_method: 9,
    faculty: 10,
    campus: 11,
    credits: 12,
    capacity: 13,
    start_date: 17,
    end_date: 18,
    building: 20,
    room: 21,
    start_time: 22,
    end_time: 23,
    days: 24,
    noteAcademicAffairs: 27,
    notePrintedComments: 28,
  });

  const dataList: DataFormat[] = [
    { id: "noteWhatHasChanged", name: "What Has Changed?" },
    { id: "section_id", name: "Section ID" },
    { id: "term", name: "Term" },
    { id: "div", name: "Division" },
    { id: "department", name: "Department" },
    { id: "subject", name: "Subject" },
    { id: "course_number", name: "Course Number" },
    { id: "section", name: "Section" },
    { id: "title", name: "Title" },
    { id: "instruction_method", name: "Instruction Method" },
    { id: "faculty", name: "Faculty" },
    { id: "campus", name: "Campus" },
    { id: "credits", name: "Credits" },
    { id: "capacity", name: "Capacity" },
    { id: "start_date", name: "Start Date" },
    { id: "end_date", name: "End Date" },
    { id: "building", name: "Building" },
    { id: "room", name: "Room" },
    { id: "start_date", name: "Start Time" },
    { id: "end_time", name: "End Time" },
    { id: "days", name: "Days" },
    { id: "noteAcademicAffairs", name: "Note For Academic Affairs" },
    { id: "notePrintedComments", name: "Printed Comments" },
  ];

  //This is technically no longer needed, but will be kept just in case
  // const tableBody: Array<Array<string> | undefined> = [];
  // if (uploaded != undefined) {
  //   for (let i = 1; i < uploaded.length; i++) {
  //     tableBody.push(uploaded[i]);
  //   }
  // }

  const getSelectValue = (index: number) => {
    console.log({ organize, index });
    let key = "default";
    for (const i in organize) {
      if (organize[i] == index) {
        key = i;
        break;
      }
    }
    console.log(key);
    return key;
  };

  /**
   * onSelect - When a dropdown of a column is selected, we want to preform said event
   * @param event
   */
  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //Get the column
    const column = +event.target.id;
    //Get the title
    const title = event.target.value;
    //Get the previous key
    const previousKey = getSelectValue(column);
    //Grab all organized columns, update the current column to new and make the old key null
    setOrganize({
      //Spread organized
      ...organize,
      //Grab title (as key) and set to column value
      [title]: column,
      //Lastly spread a dynamic object ONLY if the previous key isn't default
      ...(previousKey != "default" && { [previousKey]: null }),
    });
  };

  return (
    <div className="sticky top-0 h-96 overflow-x-auto overflow-y-auto">
      {uploaded != undefined ? (
        <Table className="sticky top-0 table-fixed border-collapse">
          <thead className="sticky top-0">
            <tr className="sticky top-0">
              <span />
              {uploaded[0] !== undefined ? (
                uploaded[0].map((columnName, index) => {
                  return (
                    <th
                      className="sticky top-0 w-1/3 flex-wrap border border-slate-600"
                      key={index}
                    >
                      {columnName.length > 25
                        ? `${columnName.substring(0, 25)}...`
                        : columnName}
                      <br />
                      <Select
                        value={getSelectValue(index)}
                        size="xs"
                        onChange={onSelect}
                        className="w-40"
                        bordered={true}
                        color="ghost"
                        id={index + ""}
                      >
                        {dataList.map((item, index) => {
                          if (index === 0) {
                            return (
                              <>
                                <option value={"default"}></option>
                                <option value={item.id} key={index}>
                                  {item.name}
                                </option>
                                ;
                              </>
                            );
                          }
                          return (
                            <option value={item.id} key={index}>
                              {item.name}
                            </option>
                          );
                        })}
                      </Select>
                    </th>
                  );
                })
              ) : (
                <></>
              )}
            </tr>
          </thead>
          <tbody>
            {/* This removes the first row with a simple slice, instead of making a new array */}
            {uploaded.slice(1).map((item, index) => {
              return (
                <tr key={index}>
                  <span />
                  {item?.map((value, index) => {
                    return (
                      <td
                        className=" w-1/3 border border-slate-600"
                        key={index}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <span className="font-bold ">
          <NoteOff size={48} strokeWidth={0.5} color={"#000000"} /> NO DATA WAS
          FOUND IN THE FILE!
        </span>
      )}
    </div>
  );
};

export default ProjectDataTableEdit;
