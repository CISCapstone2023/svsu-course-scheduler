import React, { useState } from "react";
import { Select } from "react-daisyui";
interface DataFormat {
  id: number;
  name: string;
}
interface DropdownCountProps {
  children?: React.ReactNode;
}

const DropdownCol = ({}: DropdownCountProps) => {
  const [value, setValue] = useState("default");
  //section_id: 1,
  // term: 2,
  // noteWhatHasChanged: 0,
  // div: 3,
  // department: 4,
  // subject: 5,
  // course_number: 6,
  // section: 7,
  // title: 8,
  // instruction_method: 9,
  // faculty: 10,
  // campus: 11,
  // credits: 12,
  // capacity: 13,
  // start_date: 17,
  // end_date: 18,
  // building: 20,
  // room: 21,
  // start_time: 22,
  // end_time: 23,
  // days: 24,
  // noteAcademicAffairs: 27,
  // notePrintedComments: 28,
  const dataList: DataFormat[] = [
    { id: 1, name: "Section ID" },
    { id: 2, name: "Term" },
    { id: 0, name: "What Has Changed?" },
    { id: 3, name: "Div" },
    { id: 4, name: "Department" },
    { id: 5, name: "Subject" },
    { id: 6, name: "Course Number" },
    { id: 7, name: "Section" },
    { id: 8, name: "Title" },
    { id: 9, name: "Instruction Method" },
    { id: 10, name: "Faculty" },
    { id: 11, name: "Campus" },
    { id: 12, name: "Credits" },
    { id: 13, name: "Capacity" },
    { id: 17, name: "Start Date" },
    { id: 18, name: "End Date" },
    { id: 20, name: "Building" },
    { id: 21, name: "Room" },
    { id: 22, name: "Start Time" },
    { id: 23, name: "End Time" },
    { id: 24, name: "Days" },
    { id: 27, name: "Note For Academic Affairs" },
    { id: 28, name: "Printed Comments" },
    { id: -1, name: "Others" },
  ];

  return (
    <Select
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className="w-40"
      size="sm"
    >
      {dataList.map((item) => {
        return <option key={item.id}>{item.name}</option>;
      })}
    </Select>
  );
};

export default DropdownCol;
