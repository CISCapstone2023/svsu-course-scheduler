import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  Select,
  Textarea,
} from "react-daisyui";
import { courseSchema, ICourseSchema } from "src/validation/courses";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { TimeInput } from "./TimeInput";
import { ErrorMessage } from "@hookform/error-message";

interface CreateCourseModalProps {
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

const CreateCourseModal = ({
  children,
  open,
  onClose,
}: CreateCourseModalProps) => {
  const facultyLoadOptions = (
    value: string,
    callback: (options: any) => void
  ) => {
    //no api :(
    callback([{ value: "Bob", label: "Bob" }]);
  };

  const buildingLoadOptions = (
    value: string,
    callback: (options: any) => void
  ) => {
    //no api :(
    callback([{ value: "SW", label: "SW" }]);
  };

  const { reset, ...courseAddForm } = useForm<ICourseSchema>({
    mode: "onChange",
    resolver: zodResolver(courseSchema),
  });

  const locationFields = useFieldArray({
    name: "locations",
    control: courseAddForm.control,
  });

  const onCourseAddModifySubmit = (course: ICourseSchema) => {
    console.log(course);
  };

  const [isCourseEditing, setCourseEditing] = useState<ICourseSchema>();

  return (
    <Modal
      open={open}
      onClickBackdrop={onClose}
      className="h-full  w-3/4 max-w-5xl "
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
        <form
          onSubmit={courseAddForm.handleSubmit(onCourseAddModifySubmit)}
          className="w-full"
        >
          <div className="flex h-full w-full" id="parent">
            <div
              className="flex w-full flex-col space-y-5 p-2"
              id="mainSection"
            >
              <div className="flex w-full flex-row space-x-4" id="firstRow">
                <div className="grow flex-col" id="departmentAlign">
                  <div className="w-50 m-2 flex h-8 items-center">
                    <p>Department</p>
                  </div>
                  <div>
                    {/* Department */}
                    <Input
                      type="text"
                      className="w-full"
                      size="sm"
                      {...courseAddForm.register("department")}
                    />
                    <ErrorMessage
                      errors={courseAddForm.formState.errors}
                      name="department"
                      render={({ message }) => (
                        <p className="font-semibold text-red-600">{message}</p>
                      )}
                    />
                  </div>
                </div>

                <div className="grow flex-col" id="courseAlign">
                  <div className="w-50 m-2 flex h-8 items-center">
                    <p>Course</p>
                  </div>
                  <div>
                    <Input
                      type="text"
                      className="w-full"
                      size="sm"
                      {...courseAddForm.register("course_number")}
                    />
                    <ErrorMessage
                      errors={courseAddForm.formState.errors}
                      name="course_number"
                      render={({ message }) => (
                        <p className="font-semibold text-red-600">{message}</p>
                      )}
                    />
                  </div>
                </div>

                <div className="grow flex-col" id="sectionAlign">
                  <div className="w-50 m-2 flex h-8 items-center">
                    <p>Section</p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      className="w-full"
                      size="sm"
                      min="0"
                      max="100"
                      {...courseAddForm.register("section", {
                        setValueAs: (v) => (v === "" ? undefined : parseInt(v)),
                      })}
                    />
                    <ErrorMessage
                      errors={courseAddForm.formState.errors}
                      name="section"
                      render={({ message }) => (
                        <p className="font-semibold text-red-600">{message}</p>
                      )}
                    />
                  </div>
                </div>

                <div className="grow flex-col" id="facultyAlign">
                  <div className="w-50 m-2 flex h-8 items-center">
                    <p>Faculty Member</p>
                  </div>
                  <div>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={facultyLoadOptions}
                      defaultOptions
                    />
                  </div>
                </div>
              </div>
              <div className="flex" id="timeHeader">
                <div className="grow" id="timesLabel">
                  <p>Locations</p>
                </div>

                <div id="timeButton">
                  <Button
                    size="xs"
                    type="button"
                    onClick={() => {
                      locationFields.append({
                        day_monday: false,
                        day_tuesday: false,
                        day_wednesday: false,
                        day_thursday: false,
                        day_friday: false,
                        day_saturday: false,
                        day_sunday: false,
                        end_time: 1020,
                        start_time: 830,
                        is_online: false,
                        rooms: [
                          {
                            room: "",
                            building_tuid: "",
                          },
                        ],
                      });
                    }}
                  >
                    Add Locations
                  </Button>
                </div>
              </div>
              {locationFields.fields.map((item, index) => {
                return (
                  <div
                    className="rounded-md bg-gray-100 p-2"
                    id="informationBLock"
                    key={index}
                  >
                    <div
                      className="flex items-center justify-between"
                      id="locationList"
                    >
                      <div className="flex justify-center space-x-2" id="time">
                        <div className="flex flex-row items-end space-x-4">
                          <div className="flex w-full flex-col" id="starTime">
                            <div
                              className="w-50 m-1 flex h-8 items-center"
                              id="timeLbl"
                            >
                              <p>Time</p>
                            </div>
                            <div className="flex" id="timeInputBoxes">
                              {/* Custom Time Input */}
                              <Controller
                                control={courseAddForm.control}
                                defaultValue={830}
                                name={`locations.${index}.start_time`}
                                render={({
                                  field: { onChange, value, name, ref },
                                }) => {
                                  return (
                                    <TimeInput
                                      value={value}
                                      onChange={(value) => {
                                        onChange(value);
                                      }}
                                    />
                                  );
                                }}
                              />

                              <ErrorMessage
                                errors={courseAddForm.formState.errors}
                                name={`locations.${index}.start_time`}
                                render={({ message }) => (
                                  <p className="font-semibold text-red-600">
                                    {message}
                                  </p>
                                )}
                              />
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
                              {/* Custom Time Input */}
                              <Controller
                                control={courseAddForm.control}
                                defaultValue={830}
                                name={`locations.${index}.end_time`}
                                render={({
                                  field: { onChange, value, name, ref },
                                }) => {
                                  return (
                                    <TimeInput
                                      value={value}
                                      onChange={(value) => {
                                        onChange(value);
                                      }}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage
                                errors={courseAddForm.formState.errors}
                                name={`locations.${index}.end_time`}
                                render={({ message }) => (
                                  <p className="font-semibold text-red-600">
                                    {message}
                                  </p>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex flex-col space-y-2"
                        id="inPerson+Building"
                      >
                        <div className="flex flex-row">
                          <Checkbox className="mr-2" />
                          <p>In Person Class</p>
                        </div>

                        <div className="flex flex-row space-x-2">
                          <div>
                            <AsyncSelect
                              cacheOptions
                              loadOptions={buildingLoadOptions}
                              defaultOptions
                            />
                          </div>

                          <div>
                            <Input
                              type="number"
                              className="w-20"
                              size="sm"
                              {...courseAddForm.register(
                                `locations.${index}.rooms.0.room`
                              )}
                            />
                            <ErrorMessage
                              errors={courseAddForm.formState.errors}
                              name={`locations.${index}.rooms.0.room`}
                              render={({ message }) => (
                                <p className="font-semibold text-red-600">
                                  {message}
                                </p>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex space-x-2 text-center">
                        <div>
                          <p>M</p>
                          <Checkbox
                            {...courseAddForm.register(
                              `locations.${index}.day_monday`
                            )}
                          />
                        </div>
                        <div>
                          <p>T</p>
                          <Checkbox
                            {...courseAddForm.register(
                              `locations.${index}.day_tuesday`
                            )}
                          />
                        </div>
                        <div>
                          <p>W</p>
                          <Checkbox
                            {...courseAddForm.register(
                              `locations.${index}.day_wednesday`
                            )}
                          />
                        </div>
                        <div>
                          <p>TH</p>
                          <Checkbox
                            {...courseAddForm.register(
                              `locations.${index}.day_thursday`
                            )}
                          />
                        </div>
                        <div>
                          <p>F</p>
                          <Checkbox
                            {...courseAddForm.register(
                              `locations.${index}.day_friday`
                            )}
                          />
                        </div>
                        <div>
                          <p>Sat</p>
                          <Checkbox
                            {...courseAddForm.register(
                              `locations.${index}.day_saturday`
                            )}
                          />
                        </div>
                        <div>
                          <p>Sun</p>
                          <Checkbox
                            {...courseAddForm.register(
                              `locations.${index}.day_sunday`
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="flex h-full w-[250px] flex-col justify-between space-y-8 bg-base-200 p-1"
              id="sidebar"
            >
              <div className="grow flex-row text-left" id="1">
                <p>Changes</p>
                <Textarea
                  className="h-full w-full"
                  {...courseAddForm.register(`notes.0.note`)}
                />
              </div>
              <div className="grow flex-row text-left" id="2">
                <p>Information for Provost</p>
                <Textarea
                  className="h-full w-full"
                  {...courseAddForm.register(`notes.1.note`)}
                />
              </div>
              <div className="grow flex-row text-left" id="3">
                <p>Additional Notes</p>
                <Textarea
                  className="h-full w-full"
                  {...courseAddForm.register(`notes.2.note`)}
                />
              </div>
            </div>
          </div>
          {/* {Object.keys(courseAddForm.formState.errors)
            .reverse()
            .reduce(
              (a, field) =>
                courseAddForm.formState.errors[field] ? (
                  <span className="bg-yellow-400">
                    {courseAddForm.formState.errors[field].message}
                  </span>
                ) : (
                  a
                ),
              null
            )} */}
          <div className="flex w-full">
            <div className="grow">
              <Button>Submit</Button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateCourseModal;
