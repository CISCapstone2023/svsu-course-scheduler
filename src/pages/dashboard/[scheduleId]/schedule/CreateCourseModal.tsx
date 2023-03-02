// Imports
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

import { DevTool } from "@hookform/devtools";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";

//Local imports
import { courseSchema, ICourseSchema } from "src/validation/courses";
import { TimeInput } from "./TimeInput";
import { api } from "src/utils/api";
import { toast } from "react-toastify";

//Modal
interface CreateCourseModalProps {
  children?: React.ReactNode;
  open: boolean;
  revisionTuid: string;
  onClose: () => void;
}

const seen: any[] = [];

//Component
const CreateCourseModal = ({
  children,
  revisionTuid,
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

  //Component
  const buildingLoadOptions = (
    value: string,
    callback: (options: any) => void
  ) => {
    //no api :(
    callback([{ value: "SW", label: "SW" }]);
  };

  //When input on form is changed, zod is called to validate schema
  const { reset, ...courseAddForm } = useForm<ICourseSchema>({
    mode: "onBlur",
    resolver: zodResolver(courseSchema),
  });

  //returns list of locations
  const locationFields = useFieldArray({
    name: "locations",
    control: courseAddForm.control,
  });

  //API to get all faculty lists from backend
  const facultyMutation = api.faculty.getRevisionCourseFaculty.useMutation();

  //API to add course to database for revision
  const addCourseMutation = api.calendar.addNewRevisonCourse.useMutation();

  //Logs our submitted course (Will be changed)
  const onCourseAddModifySubmit = async (course: ICourseSchema) => {
    console.log("Hey we got here!");
    if (isCourseEditing != undefined && isCourseEditing!.tuid) {
      // const result = await courseUpdateMutation.mutateAsync({
      //   tuid: isCourseEditing!.tuid,
      //   ...data,
      // });
      // if (result) {
      //   toast.info(`Updated Course Guideline`);
      // } else {
      //   toast.error(`Failed to add Course Guideline`);
      // }
    } else {
      const result = await addCourseMutation.mutateAsync({
        course,
        tuid: revisionTuid,
      });
      if (result) {
        toast.success(`Added new course guidline`);
      } else {
        toast.error(`Failed to add course guideline`);
      }
    }

    //TODO: Tell parent to refetch
    //courses.refetch();
  };

  //asks if you are in edit mode, keeps what you want to edit
  const [isCourseEditing, setCourseEditing] = useState<ICourseSchema>();

  console.log(
    JSON.stringify(courseAddForm.formState.errors, function (key, val) {
      if (val != null && typeof val == "object") {
        if (seen.indexOf(val) >= 0) {
          return;
        }
        seen.push(val);
      }
      return val;
    })
  );

  return (
    //Main modal for body
    <Modal
      open={open}
      onClickBackdrop={onClose}
      className="h-full  w-3/4 max-w-5xl "
    >
      {/* Button to close */}
      <Button
        size="sm"
        shape="circle"
        className="absolute right-2 top-2"
        onClick={onClose}
      >
        ✕
      </Button>

      {/* Header for Modal */}
      <Modal.Header>Add / Edit Course Placement</Modal.Header>
      <Modal.Body className="h-[500px] w-full">
        <DevTool control={courseAddForm.control} /> {/* set up the dev tool */}
        {/* form to handle course additions, modifications, or submission */}
        <form
          onSubmit={courseAddForm.handleSubmit(onCourseAddModifySubmit)}
          className="w-full"
        >
          {/* Parent Div */}
          {/* Note: id="" will tell you what section is which for the divs */}
          <div className="flex h-full w-full" id="parent">
            {/* Div for mainSection of modal */}
            <div
              className="flex w-full flex-col space-y-5 p-2"
              id="mainSection"
            >
              {/* Div to align first row */}
              <div className="flex w-full flex-row space-x-4" id="firstRow">
                {/* div to align dpartment  */}
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

                    {/* Error message thrown when zod detects a problem */}
                    <ErrorMessage
                      errors={courseAddForm.formState.errors}
                      name="department"
                      render={({ message }) => (
                        <p className="font-semibold text-red-600">{message}</p>
                      )}
                    />
                  </div>
                </div>

                {/* Div aligns course */}
                <div className="grow flex-col" id="courseAlign">
                  <div className="w-50 m-2 flex h-8 items-center">
                    <p>Course</p>
                  </div>
                  <div>
                    {/* Course */}
                    <Input
                      type="text"
                      className="w-full"
                      size="sm"
                      {...courseAddForm.register("course_number")}
                    />
                    {/* Error message thrown when zod detects a problem */}
                    <ErrorMessage
                      errors={courseAddForm.formState.errors}
                      name="course_number"
                      render={({ message }) => (
                        <p className="font-semibold text-red-600">{message}</p>
                      )}
                    />
                  </div>
                </div>

                {/* div aligns section info */}
                <div className="grow flex-col" id="sectionAlign">
                  <div className="w-50 m-2 flex h-8 items-center">
                    <p>Section</p>
                  </div>
                  <div>
                    {/* section info */}
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
                    {/* Error message thrown when zod detects a problem */}
                    <ErrorMessage
                      errors={courseAddForm.formState.errors}
                      name="section"
                      render={({ message }) => (
                        <p className="font-semibold text-red-600">{message}</p>
                      )}
                    />
                  </div>
                </div>

                {/* Div aligns faculty */}
                <div className="grow flex-col" id="facultyAlign">
                  <div className="w-50 m-2 flex h-8 items-center">
                    <p>Faculty Member</p>
                  </div>
                  <div>
                    {/* Synchronous selection, allows to grab data from database and wait for it to come in */}
                    <Controller
                      name="faculty.0"
                      control={courseAddForm.control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <AsyncSelect
                          isClearable
                          defaultOptions
                          placeholder={"Enter Faculty"}
                          loadOptions={(search, callback) => {
                            new Promise<any>(async (resolve) => {
                              const data = await facultyMutation.mutateAsync({
                                search: search.toLowerCase(),
                              });

                              if (data != undefined) {
                                callback(data);
                              } else {
                                callback([]);
                              }
                            });
                          }}
                          {...field}
                          // styles={customStyles}
                        />
                      )}
                    />

                    {/* <AsyncSelect
                      cacheOptions
                      loadOptions={facultyLoadOptions}
                      defaultOptions
                    /> */}
                  </div>
                </div>
              </div>

              {/* header for label and add location button */}
              <div className="flex" id="locationHeader">
                <div className="grow" id="locationLabel">
                  <p>Locations</p>
                </div>

                {/* button to add location, open up new location field */}
                <div id="addLocationButton">
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

              {/* field for time input (in 24 hour format) */}
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
                                render={({ field }) => {
                                  return <TimeInput {...field} />;
                                }}
                              />

                              {/* Error message thrown when zod detects a problem */}
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

                              {/* Error message thrown when zod detects a problem */}
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
                      {/* Div to hold in person checkbox and building select */}
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

                            {/* Error message thrown when zod detects a problem */}
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

                    {/* Checkboxes for days */}
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
          {/* {Object.keys(courseAddForm.formState.errors).length}
          {Object.keys(courseAddForm.formState.errors)
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
