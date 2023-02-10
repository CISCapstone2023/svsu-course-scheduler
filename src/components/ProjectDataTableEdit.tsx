import React from "react";
import { Table } from "react-daisyui";
import DropdownCol from "./DropdownColumn";

interface ProjectDataTableEditProps {
  children?: React.ReactNode;
}

const ProjectDataTableEdit = ({ children }: ProjectDataTableEditProps) => {
  const column = [];
  for (let i = 0; i < 26; i++) {
    column.push(i);
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.Head>
          <span>
            SecID
            <br /> <DropdownCol curCol="1" />
          </span>
          <span>
            Term <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            Div <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            Dept
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            Subj
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            Crs
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            Sec
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            Title
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            Method
            <br /> <DropdownCol curCol={"1"} />{" "}
          </span>
          <span>
            Faculty
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Loc
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Cr
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Course Cap
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Xlst Cap
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Xlst
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            No Weeks
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            Sec Start Date <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Sec End Date
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Method2
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Bldg
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Room <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Start Time
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            End Time
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Days
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Mtg Ptrn Start Date
            <br /> <DropdownCol curCol={"1"} />
          </span>
          <span>
            {" "}
            Mtg Ptrn End Date
            <br /> <DropdownCol curCol={"1"} />
          </span>
        </Table.Head>

        <Table.Body>
          <Table.Row>
            <span>118498</span>
            <span>23/SP</span>
            <span>SC </span>
            <span>CS</span>
            <span>CIS</span>
            <span>255</span>
            <span>90</span>
            <span>Client Side Web Appl Devel</span>
            <span>LEC </span>
            <span>Avishek Mukerjee</span>
            <span> ONL</span>
            <span> 4</span>
            <span>30</span>
            <span></span>
            <span> </span>
            <span> 15</span>
            <span>2023-05-08 </span>
            <span> 2023-06-24</span>
            <span> ONL</span>
            <span> </span>
            <span> </span>
            <span> </span>
            <span> </span>
            <span> </span>
            <span> 2023-05-08</span>
            <span> 2023-06-24</span>
          </Table.Row>

          <Table.Row>
            <span>118498</span>
            <span>23/SP</span>
            <span>SC </span>
            <span>CS</span>
            <span>CS</span>
            <span>245</span>
            <span>31</span>
            <span>Stat & Its Appl in Comp Sci</span>
            <span>LEC </span>
            <span>Khandaker Abir Rahman</span>
            <span> UC</span>
            <span> 4</span>
            <span>30</span>
            <span></span>
            <span> </span>
            <span> 15</span>
            <span>2023-05-08 </span>
            <span> 2023-06-24</span>
            <span> LEC</span>
            <span> SE</span>
            <span> 121</span>
            <span>12:30 PM </span>
            <span>4:40PM </span>
            <span> T R</span>
            <span> 2023-05-08</span>
            <span> 2023-06-24</span>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  );
};

export default ProjectDataTableEdit;
