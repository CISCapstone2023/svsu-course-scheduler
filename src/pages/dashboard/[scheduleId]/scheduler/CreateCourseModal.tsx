import React, { useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  Select,
  Textarea,
} from "react-daisyui";

interface CreateCourseModalProps {
  children?: React.ReactNode;
}

const CreateCourseModal = ({ children }: CreateCourseModalProps) => {
  const [open, setOpen] = useState(true);
  const onClose = () => {
    //Close
  };
  return (
    <Modal
      open={open}
      onClickBackdrop={onClose}
      className="h-full  w-11/12 max-w-5xl "
    >
      <Button
        size="sm"
        shape="circle"
        className="absolute right-2 top-2"
        onClick={onClose}
      >
        ✕
      </Button>
      <Modal.Header>Add / Edit Course Placement</Modal.Header>
      <Modal.Body className="h-[500px] w-full">
        <div className="flex h-full w-full" id="parent">
          <div className="flex w-full flex-col space-y-5 p-2" id="mainSection">
            <div className="flex w-full flex-row justify-between" id="firstRow">
              <div className="flex-col" id="departmentAlign">
                <div className="w-50 m-2 flex h-8 items-center">
                  <p>Department</p>
                </div>
                <div>
                  <Select size="sm">
                    <option value={"default"} disabled>
                      Pick a Department
                    </option>
                    <option value={"CIS"}>CIS</option>
                    <option value={"CS"}>CS</option>
                  </Select>
                </div>
              </div>

              <div className="flex-col" id="courseAlign">
                <div className="w-50 m-2 flex h-8 items-center">
                  <p>Course</p>
                </div>
                <div>
                  <Select size="sm">
                    <option value={"default"} disabled>
                      Pick a Course
                    </option>
                    <option value={"300"}>300</option>
                    <option value={"301"}>301</option>
                  </Select>
                </div>
              </div>

              <div className="flex-col" id="sectionAlign">
                <div className="w-50 m-2 flex h-8 items-center">
                  <p>Section</p>
                </div>
                <div>
                  <Select size="sm">
                    <option value={"default"} disabled>
                      Pick a Section
                    </option>
                    <option value={"1"}>1</option>
                    <option value={"2"}>2</option>
                  </Select>
                </div>
              </div>

              <div className="flex-col" id="facultyAlign">
                <div className="w-50 m-2 flex h-8 items-center">
                  <p>Faculty Member</p>
                </div>
                <div>
                  <Select size="sm">
                    <option value={"default"} disabled>
                      Pick a Faculty Member
                    </option>
                    <option value={"James"}>James</option>
                    <option value={"Avishek"}>Avishek</option>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex" id="timeHeader">
              <div className="grow" id="timesLabel">
                <p>Locations</p>
              </div>

              <div id="timeButton">
                <Button size="xs">Add Locations</Button>
              </div>
            </div>

            <div
              className="flex items-center justify-between"
              id="locationList"
            >
              <div className="flex justify-center space-x-2" id="location">
                <div className="flex flex-row items-end space-x-4">
                  <div className="flex w-full flex-col" id="starTime">
                    <div
                      className="w-50 m-1 flex h-8 items-center"
                      id="timeLbl"
                    >
                      <p>Time</p>
                    </div>
                    <div className="flex" id="timeInputBoxes">
                      <Input type="number" className="w-20" size="sm" />
                      <Input type="number" className="w-20" size="sm" />
                    </div>
                  </div>
                  <div className="mb-2 flex">
                    <p>to</p>
                  </div>
                  <div className="flex w-full flex-col" id="endTime">
                    <div
                      className="w-50 m-1 flex h-8 items-center"
                      id="timeLbl"
                    >
                      <p>Time</p>
                    </div>
                    <div className="flex" id="timeInputBoxes">
                      <Input type="number" className="w-20" size="sm" />
                      <Input type="number" className="w-20" size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2" id="inPerson+Building">
                <div className="flex flex-row">
                  <Checkbox className="mr-2" />
                  <p>In Person Class</p>
                </div>

                <div className="flex flex-row space-x-2">
                  <div>
                    <Select size="sm">
                      <option value={"default"} disabled>
                        Pick a Building
                      </option>
                      <option value={"SW"}>SW</option>
                      <option value={"SE"}>SE</option>
                    </Select>
                  </div>

                  <div>
                    <Select size="sm">
                      <option value={"default"} disabled>
                        Pick a Room
                      </option>
                      <option value={"120"}>120</option>
                      <option value={"121"}>121</option>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex space-x-2 text-center">
                <div>
                  <p>M</p>
                  <Checkbox />
                </div>
                <div>
                  <p>T</p>
                  <Checkbox />
                </div>
                <div>
                  <p>W</p>
                  <Checkbox />
                </div>
                <div>
                  <p>TH</p>
                  <Checkbox />
                </div>
                <div>
                  <p>F</p>
                  <Checkbox />
                </div>
                <div>
                  <p>Sat</p>
                  <Checkbox />
                </div>
                <div>
                  <p>Sun</p>
                  <Checkbox />
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex h-full w-[250px] flex-col justify-between space-y-8 bg-base-200 p-1"
            id="sidebar"
          >
            <div className="grow flex-row text-left" id="1">
              <p>Changes</p>
              <Textarea className="h-full w-full" />
            </div>
            <div className="grow flex-row text-left" id="2">
              <p>Information for Provost</p>
              <Textarea className="h-full w-full" />
            </div>
            <div className="grow flex-row text-left" id="3">
              <p>Additional Notes</p>
              <Textarea className="h-full w-full" />
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CreateCourseModal;
