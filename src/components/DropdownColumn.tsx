import React, { useState } from "react";
import { Select } from "react-daisyui";

interface DropdownCountProps {
  children?: React.ReactNode;
  curCol?: string;
}

const DropdownCol = ({ children, curCol }: DropdownCountProps) => {
  const [value, setValue] = useState("default");

  return (
    <Select value={value} onChange={(event) => setValue(event.target.value)}>
      <option value={"1"}>Col 1</option>
      <option value={"2"}>Col 2</option>
      <option value={"3"}>Col 3</option>
      <option value={"4"}>Col 4</option>
      <option value={"5"}>Col 5</option>
      <option value={"6"}>Col 6</option>
    </Select>
  );
};

export default DropdownCol;
