import React, { useState } from "react";
import { Select, Table } from "react-daisyui";

import { AlertTriangle, NoteOff } from "tabler-icons-react";

interface ProjectDataTableEditProps {
  uploaded: Array<Array<string>> | undefined;
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
  const [organize, setOrganize] = useState<Record<number, string>>(preSet);

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

  // eslint-disable-next-line prefer-const
  let tableBody: Array<Array<string> | undefined> = [];
  if (uploaded != undefined) {
    for (let i = 1; i < uploaded.length; i++) {
      tableBody.push(uploaded[i]);
    }
  }

  const handleOraganize = (column: number, title: string) => {
    setOrganize({ ...organize, [column]: title });
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
                      {columnName}
                      <br />
                      <Select
                        value={organize[index]}
                        size="xs"
                        onChange={(event) => {
                          handleOraganize(+event.target.id, event.target.value);
                          const updatedColumn = {
                            ...organize,
                            [+event.target.id]: event.target.value,
                          };

                          // loop through the record
                          for (const column in Object.keys(updatedColumn)) {
                            const title = Object.values(updatedColumn)[column];
                            if (
                              title !== undefined &&
                              column !== event.target.id &&
                              title !== "default" &&
                              title.includes(event.target.value)
                            ) {
                              handleOraganize(+column, "default");

                              setOrganize({
                                ...updatedColumn,
                                [+column]: "default",
                              });
                              break;
                            }
                          }
                        }}
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
            {tableBody.map((item, index) => {
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
