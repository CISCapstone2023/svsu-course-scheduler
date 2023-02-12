import React from "react";
import { Table } from "react-daisyui";
import { NoteOff } from "tabler-icons-react";
import DropdownCol from "./DropdownColumn";

interface ProjectDataTableEditProps {
  uploaded: Array<Array<string>>;
}

const ProjectDataTableEdit = ({ uploaded }: ProjectDataTableEditProps) => {
  // eslint-disable-next-line prefer-const
  let tableBody: Array<Array<string> | undefined> = [];
  if (uploaded != undefined) {
    for (let i = 1; i < uploaded.length; i++) {
      tableBody.push(uploaded[i]);
    }
  }

  return (
    <div className="overflow-x-auto">
      {uploaded != undefined ? (
        <Table className="table-fixed border-collapse">
          <thead>
            <span />
            {uploaded[0].map((columnName, index) => {
              return (
                <th className="border border-slate-600" key={index}>
                  {columnName}
                </th>
              );
            })}
          </thead>
          <tbody>
            {tableBody.map((item, index) => {
              return (
                <tr key={index}>
                  <span />
                  {item?.map((value, index) => {
                    return (
                      <td className="border border-slate-600" key={index}>
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
