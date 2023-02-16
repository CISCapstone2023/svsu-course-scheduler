import React, { useState } from "react";
import { Select, Table } from "react-daisyui";
import ReactDOM from "react-dom";
import { AlertTriangle, NoteOff } from "tabler-icons-react";

interface ProjectDataTableEditProps {
  uploaded: Array<Array<string>> | undefined;
}
interface DataFormat {
  id: string;
  name: string;
}

const ProjectDataTableEdit = ({ uploaded }: ProjectDataTableEditProps) => {
  const [organize, setOrganize] = useState<Record<number, string>>([]);
  const [duplicate, setduplicate] = useState<boolean>(false);
  const [dupColumn, setDupCol] = useState<string>("");

  const updateColumn = (value: number, item: string) => {
    setOrganize({ ...organize, [value]: item });

    console.log({ ...organize, [value]: item });
  };
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

  return (
    <div className="overflow-x-auto">
      {duplicate ? (
        <div className="sticky  left-0 flex font-semibold text-red-700">
          <AlertTriangle size={36} strokeWidth={1.5} color={"#bf4042"} />
          Duplicate Entry Found at {dupColumn}!
        </div>
      ) : (
        <></>
      )}
      {uploaded != undefined ? (
        <Table className="table-fixed border-collapse">
          <thead>
            <span />
            {uploaded[0] !== undefined ? (
              uploaded[0].map((columnName, index) => {
                return (
                  <th
                    className="w-1/3 flex-wrap border border-slate-600"
                    key={index}
                  >
                    {columnName}
                    <br />
                    <Select
                      defaultValue={"default"}
                      size="xs"
                      onChange={(event) => {
                        updateColumn(+event.target.id, event.target.value);
                        const updatedColumn = {
                          ...organize,
                          [+event.target.id]: event.target.value,
                        };
                        // loop through the record
                        for (const column in Object.keys(updatedColumn)) {
                          const title = Object.values(updatedColumn)[column];

                          for (const col in Object.keys(updatedColumn)) {
                            const titleCol = Object.values(updatedColumn)[col];
                            if (
                              title !== undefined &&
                              title !== "default" &&
                              titleCol !== "default" &&
                              titleCol !== undefined &&
                              column !== col &&
                              title.includes(titleCol)
                            ) {
                              console.log(title, column, titleCol, col);
                              setduplicate(true);
                              setDupCol(+column + 1 + " and " + (+col + 1));
                              break;
                            } else setduplicate(false);
                          }
                        }
                      }}
                      className="w-40"
                      bordered={true}
                      color={duplicate ? "error" : "ghost"}
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
