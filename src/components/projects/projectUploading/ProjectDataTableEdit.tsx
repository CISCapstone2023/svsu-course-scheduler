import { findKey } from "lodash";
import React, { useState } from "react";
import { Table } from "react-daisyui";
import Select from "react-select";
import { AlertTriangle, NoteOff } from "tabler-icons-react";

interface ProjectDataTableEditProps {
  uploaded: Array<Array<string>> | undefined;
  columns: Record<string, number | null>;
  onUpdateOrganizedColumns: (value: { [x: string]: number | null }) => void;
}
interface IColumnLookupTable {
  value: string;
  label: string;
}

export const columnLookupTable: readonly IColumnLookupTable[] = [
  { value: "noteWhatHasChanged", label: "What Has Changed?" },
  { value: "section_id", label: "Section ID" },
  { value: "term", label: "Term" },
  { value: "div", label: "Division" },
  { value: "department", label: "Department" },
  { value: "subject", label: "Subject" },
  { value: "course_number", label: "Course Number" },
  { value: "section", label: "Section" },
  { value: "title", label: "Title" },
  { value: "instruction_method", label: "Instruction Method" },
  { value: "faculty", label: "Faculty" },
  { value: "campus", label: "Campus/Location" },
  { value: "credits", label: "Credits" },
  { value: "capacity", label: "Capacity" },
  { value: "start_date", label: "Start Date" },
  { value: "end_date", label: "End Date" },
  { value: "building", label: "Building" },
  { value: "room", label: "Room" },
  { value: "start_time", label: "Start Time" },
  { value: "end_time", label: "End Time" },
  { value: "days", label: "Days" },
  { value: "course_method", label: "Course Method/Method 2" },
  { value: "course_start_date", label: "Course/Meeting Start Date" },
  { value: "course_end_date", label: "Course/Meeting Emd Date" },
  { value: "noteAcademicAffairs", label: "Note For Academic Affairs" },
  { value: "notePrintedComments", label: "Printed Comments" },
];

const ProjectDataTableEdit = ({
  uploaded,
  columns,
  onUpdateOrganizedColumns,
}: ProjectDataTableEditProps) => {
  //This is technically no longer needed, but will be kept just in case
  // const tableBody: Array<Array<string> | undefined> = [];
  // if (uploaded != undefined) {
  //   for (let i = 1; i < uploaded.length; i++) {
  //     tableBody.push(uploaded[i]);
  //   }
  // }

  const getSelectValue = (index: number): IColumnLookupTable => {
    //Key is "default", which basically means its null
    let key: IColumnLookupTable = { label: "", value: "default" };
    //Loop over all organized columns
    for (const i in columns) {
      //Check of we have the same index
      if (columns[i] == index && i != "default") {
        const value = columnLookupTable.find((item) => {
          return item.value == i;
        }); //If so we set the key to our index (which is the loops key) and break
        if (value != undefined) {
          key = value;
        }
        break;
      }
    }
    //Finally return the key
    return key;
  };

  /**
   * onSelect - When a dropdown of a column is selected, we want to preform said event
   * @param event
   */
  const onSelect = (column: number, title: string) => {
    //Get the previous key
    const previousKey = getSelectValue(column);
    //Grab all organized columns, update the current column to new and make the old key null
    const columnChanged = {
      //Spread organized
      ...columns,
      //Grab title (as key) and set to column value ONLY if the current key isn't default
      ...(title != "default" && { [title]: column }),
      //Lastly spread a dynamic object ONLY if the previous key isn't default
      ...(previousKey.value != "default" && { [previousKey?.value]: -1 }),
    };
    onUpdateOrganizedColumns(columnChanged);
  };

  return (
    <div className="sticky top-0 h-96 overflow-x-auto overflow-y-scroll">
      {uploaded != undefined ? (
        <Table className="sticky top-0 table-fixed border-collapse">
          <thead className="sticky top-0">
            <tr className="sticky top-0">
              <span />
              {uploaded[0] !== undefined &&
                uploaded[0].map((columnName, index) => {
                  return (
                    <th
                      className="top-0 w-[200px] justify-center border border-slate-600"
                      key={index}
                    >
                      {columnName.length > 20
                        ? `${columnName.substring(0, 20)}...`
                        : columnName}
                      <br />

                      <div className="w-[200px]">
                        <Select
                          options={columnLookupTable as any}
                          defaultValue={getSelectValue(index)}
                          value={getSelectValue(index)}
                          classNamePrefix="selection"
                          onChange={(newValue) => {
                            onSelect(index, newValue!.value);
                          }}
                        />
                      </div>
                    </th>
                  );
                })}
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
                        className=" w-1/3 border border-slate-600 p-1"
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
