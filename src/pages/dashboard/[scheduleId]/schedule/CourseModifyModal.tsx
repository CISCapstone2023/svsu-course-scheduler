// Imports
import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Checkbox, Input, Modal, Radio, Textarea } from "react-daisyui";

import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";

//Local imports
import {
  calendarCourseSchema,
  Semesters,
  type ICalendarCourseSchema,
} from "src/validation/calendar";
import TimeInput from "./TimeInput";
import { api } from "src/utils/api";
import { toast } from "react-toastify";
import { Trash } from "tabler-icons-react";
import AnimatedSpinner from "src/components/AnimatedSpinner";
import { CourseState } from "@prisma/client";
import { type ICourseSchemaWithMetadata } from "src/server/api/routers/calendar";

/**
 * Create Course Modal Properties
 *
 * Default properties for this component
 *
 */
interface CreateCourseModalProps {
  children?: React.ReactNode;
  open: boolean; //Is the modal open?
  revisionTuid: string; //The tuid of the current revision
  edit: string | null; //The state of editing by an id
  copy: string | null; //The state of copying by an id
  onClose: () => void; //onClose closure
  onSuccess: () => void; //onSuccess closure
}

//Used for debugging
const seen: any[] = [];

/**
 * Create Course Modal Component
 *
 * This component defines a modal for creating, editing, and copying
 * course information. It provides a form that's binded to a react-form-hook
 * form, which uses validation from the validation folder for the calendar.
 *
 * The editing and copying properties allow for allocation of modes depending on
 * how this component is loaded. If an id of an editing course occurs, it will
 * be fetched from the backend API and loaded into the form.
 *
 * As for copying, the course is fetched by id from the database and then removes
 * the data that needs to be unique for a new course on said current revision.
 *
 * Any saving or adding is done based on the provided `revisionTuid`.
 *
 * @params CreateCourseModalProps
 * @returns
 * @author Brendan Fuller
 */
const CreateCourseModal = ({
  revisionTuid,
  onSuccess,
  open,
  onClose,
  copy,
  edit = null,
}: CreateCourseModalProps) => {
  //When input on form is changed, zod is called to validate schema
  const { reset, ...courseAddForm } = useForm<ICalendarCourseSchema>({
    mode: "onBlur",
    resolver: zodResolver(calendarCourseSchema),
  });

  //returns list of locations
  const locationFields = useFieldArray({
    name: "locations",
    control: courseAddForm.control,
  });

  //API to get all faculty lists from backend
  const facultyMutation = api.faculty.getRevisionCourseFaculty.useMutation();

  /**
   * Department Mutation
   *
   * Gets a list of all of the departments for the dropdown autofill select
   */
  const departmentMutation =
    api.department.getAllDepartmentAutofill.useMutation();

  /**
   * Subject Mutation
   *
   * Gets a list of all of the departments for the dropdown autofill select
   */
  const subjectMutation = api.subjects.getAllSubjectsAutofill.useMutation();

  /**
   * Building Mutation
   *
   * Gets a list of all of the departments for the dropdown autofill select
   */
  const buildingMutation = api.buildings.getBuildingsList.useMutation();

  /**
   * Add Course Mutation
   *
   * When a course is adding state, this mutation will be called
   */
  const addCourseMutation = api.calendar.addCourseToRevision.useMutation();

  /**
   * Update Course Mutation
   *
   * When an update on a course occurs, this mutation is called
   */
  const updateCourseMutation = api.calendar.updateRevisionCourse.useMutation();

  /**
   * Delete (soft) Course Mutation
   *
   * When an soft delete on a course occurs, this mutation is called.
   * Also this is used to recover said soft delete as its inverted in
   * the API code.
   */
  const removeCourseMutation = api.calendar.removeCourse.useMutation();

  /**
   * Edit Course Mutation
   *
   * The mutation to be called only when editing/copying a course.
   * as we want to get the information about said course.
   */
  const getEditCourseMutation = api.calendar.getCourse.useMutation();

  /**
   * On Mount Event (useEffect)
   *
   *
   */
  useEffect(() => {
    //Make an async function to await for the backend API
    const getEditedCourse = async () => {
      const result = await getEditCourseMutation.mutateAsync({
        tuid: edit!,
      });

      //If we have a result, then reset the form to the values
      if (result != undefined) {
        reset(result);
        //Set editing mode to said result (course)
        setCourseEditing(result);
      }
    };

    //Only run editing mode if we have an id passed to said modal
    if (edit != null) {
      getEditedCourse();
    }

    const getCopiedCourse = async () => {
      //Get the result of copying but force all types to not be required
      const result = (await getEditCourseMutation.mutateAsync({
        tuid: copy!,
      })) as Partial<ICourseSchemaWithMetadata>;

      //If said course is valid and found
      if (result != undefined) {
        //Reset the values for copy
        result.section_id = null;

        //This is only possible because of said partial
        result.faculty = undefined;
        result.start_date = undefined;
        result.end_date = undefined;

        //Now update the form with said values
        reset(result);
      }
    };

    //Only run copying mode if we have an id passed to said modal
    if (copy != null) {
      getCopiedCourse();
    }
  }, []);

  //Logs our submitted course (Will be changed)
  const onCourseAddModifySubmit = async (course: ICalendarCourseSchema) => {
    console.log("Hey we got here!");
    console.log({ isCourseEditing });
    if (isCourseEditing != undefined && isCourseEditing!.tuid) {
      const result = await updateCourseMutation.mutateAsync({
        tuid: isCourseEditing!.tuid,
        ...course,
      });
      if (result) {
        toast.info(`Updated Course Guideline`);
        onSuccess();
      } else {
        toast.error(`Failed to add Course Guideline`);
      }
    } else {
      const result = await addCourseMutation.mutateAsync({
        course,
        tuid: revisionTuid,
      });
      if (result == true) {
        toast.success(`Added new course!`);
        onSuccess();
      } else {
        toast.error(`Failed to add course guideline`);
      }
    }

    //TODO: Tell parent to refetch
    //courses.refetch();
  };

  //asks if you are in edit mode, keeps what you want to edit
  const [isCourseEditing, setCourseEditing] =
    useState<ICalendarCourseSchema | null>();

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
      onClickBackdrop={() => {
        onClose();
        setCourseEditing(null);
      }}
      className=" max-h-screen max-w-5xl "
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
      <Modal.Header>
        {isCourseEditing ? "Edit" : copy == null ? "Add" : "Copy"} Course
        Placement
      </Modal.Header>
      <Modal.Body className="max-h-screen  w-full">
        {/* <DevTool control={courseAddForm.control} /> set up the dev tool */}
        {/* form to handle course additions, modifications, or submission */}
        {/* add conditional check for loading if is editing */}
        {(edit == null || (edit != null && isCourseEditing)) && (
          <form
            onSubmit={courseAddForm.handleSubmit(onCourseAddModifySubmit)}
            className="h-full w-full"
          >
            {/* Parent Div */}
            {/* Note: id="" will tell you what section is which for the divs */}
            <div className="mb-10 flex h-full w-full" id="parent">
              {/* Div for mainSection of modal */}
              <div className="flex w-full flex-col pr-2" id="mainSection">
                {/* Div to align first row */}

                <div
                  className="mt-1 flex w-full flex-row space-x-4"
                  id="firstRow"
                >
                  {/* div to align section id of course  */}
                  <div className="grow flex-col" id="departmentAlign">
                    <div className="w-50 flex h-8 items-center">
                      <p>Section Identifier</p>
                    </div>
                    <div>
                      {/* Section id */}
                      <Input
                        type="text"
                        className="w-full"
                        size="sm"
                        disabled={true}
                        {...courseAddForm.register("section_id")}
                      />

                      {/* Error message thrown when zod detects a problem */}
                    </div>
                  </div>

                  {/* Div aligns title of course */}
                  <div className="grow flex-col" id="courseAlign">
                    <div className="w-50  flex h-8 items-center">
                      <p>Title</p>
                    </div>
                    <div>
                      {/* Title */}
                      <Input
                        type="text"
                        className="w-full"
                        size="sm"
                        {...courseAddForm.register("title")}
                        disabled={false}
                      />
                    </div>
                  </div>
                </div>

                {/* div for second row of elements */}
                <div
                  className="mt-1 flex w-full flex-row space-x-4"
                  id="firstRow"
                >
                  {/* div aligns term year */}
                  <div className="grow flex-col" id="sectionAlign">
                    <div className="w-50  flex h-8 items-center">
                      <p>Term Year</p>
                    </div>
                    <div>
                      {/* term year */}
                      <Input
                        type="number"
                        className="w-full"
                        size="sm"
                        min="0"
                        max="99"
                        {...courseAddForm.register("term", {
                          setValueAs: (v) =>
                            v === "" ? undefined : parseInt(v),
                        })}
                      />
                      {/* Error message thrown when zod detects a problem */}
                      <ErrorMessage
                        errors={courseAddForm.formState.errors}
                        name="term"
                        render={({ message }) => (
                          <p className="font-semibold text-red-600">
                            {message}
                          </p>
                        )}
                      />
                    </div>
                  </div>

                  {/* div aligns credit amount */}
                  <div className="grow flex-col" id="sectionAlign">
                    <div className="w-50  flex h-8 items-center">
                      <p>Credits</p>
                    </div>
                    <div>
                      {/* term year */}
                      <Input
                        type="number"
                        className="w-full"
                        size="sm"
                        min="1"
                        max="4"
                        {...courseAddForm.register("credits", {
                          setValueAs: (v) =>
                            v === "" ? undefined : parseInt(v),
                        })}
                      />
                      {/* Error message thrown when zod detects a problem */}
                      <ErrorMessage
                        errors={courseAddForm.formState.errors}
                        name="credits"
                        render={({ message }) => (
                          <p className="font-semibold text-red-600">
                            {message}
                          </p>
                        )}
                      />
                    </div>
                  </div>

                  {/* div to start date  */}
                  <div className="grow flex-col" id="departmentAlign">
                    <div className="w-50  flex h-8 items-center">
                      <p>Start Date</p>
                    </div>
                    <div>
                      <Controller
                        name={"start_date"}
                        control={courseAddForm.control}
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
                            selected={value}
                            onChange={onChange}
                            className="rounded-lg border-[1px] border-gray-300 p-1"
                          />
                        )}
                      />

                      {/* Error message thrown when zod detects a problem */}
                      <ErrorMessage
                        errors={courseAddForm.formState.errors}
                        name="start_date"
                        render={({ message }) => (
                          <p className="font-semibold text-red-600">
                            {message}
                          </p>
                        )}
                      />
                    </div>
                  </div>

                  {/* Div end date */}
                  <div className="flex-col" id="courseAlign">
                    <div className="w-50  flex h-8 items-center">
                      <p>End Date</p>
                    </div>
                    <div>
                      {/* end date */}
                      <Controller
                        name={"end_date"}
                        control={courseAddForm.control}
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
                            selected={value}
                            onChange={onChange}
                            className="rounded-lg border-[1px] border-gray-300 p-1"
                          />
                        )}
                      />
                      {/* Error message thrown when zod detects a problem */}
                      <ErrorMessage
                        errors={courseAddForm.formState.errors}
                        name="end_date"
                        render={({ message }) => (
                          <p className="font-semibold text-red-600">
                            {message}
                          </p>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* div for third row of elements */}
                <div
                  className="mt-1 flex w-full flex-row space-x-4"
                  id="firstRow"
                >
                  {/* div to align department  */}
                  <div className="grow flex-col" id="departmentAlign">
                    <div className="w-50  flex h-8 items-center">
                      <p>Department</p>
                    </div>
                    <div>
                      <Controller
                        name="department"
                        control={courseAddForm.control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange, ref } }) => (
                          <AsyncSelect
                            isClearable
                            defaultOptions
                            className="w-[150px]"
                            placeholder={"Enter Department"}
                            blurInputOnSelect={true}
                            loadOptions={(search, callback) => {
                              //Create promise for the current options being loadded
                              new Promise<any>(async (resolve) => {
                                //Now call the mutation to find any faculty by the search value
                                const data =
                                  await departmentMutation.mutateAsync({
                                    search: search.toLowerCase(),
                                  });

                                //If we do have data, set it to the callback,
                                //which is basaically an update function
                                if (data != undefined) {
                                  callback(data);
                                  resolve(true);
                                } else {
                                  //Else instead just set it to nothing
                                  callback([]);
                                  resolve(true);
                                }
                              });
                            }}
                            //Manually pass in the props with values
                            value={value}
                            ref={ref}
                            onChange={(event) => {
                              onChange(event);
                            }}
                            //styles={customStyles}
                          />
                        )}
                      />

                      {/* Error message thrown when zod detects a problem */}
                      <ErrorMessage
                        errors={courseAddForm.formState.errors}
                        name="department"
                        render={({ message }) => (
                          <p className="font-semibold text-red-600">
                            {message}
                          </p>
                        )}
                      />
                    </div>
                  </div>
                  {/* div to align subject  */}
                  <div className="grow flex-col" id="departmentAlign">
                    <div className="w-50 flex h-8 items-center">
                      <p>Subject</p>
                    </div>
                    <div>
                      {/* Department */}
                      <Controller
                        name="subject"
                        control={courseAddForm.control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange, ref } }) => (
                          <AsyncSelect
                            isClearable
                            defaultOptions
                            className="w-[150px]"
                            placeholder={"Enter Subject"}
                            blurInputOnSelect={true}
                            loadOptions={(search, callback) => {
                              //Create promise for the current options being loadded
                              new Promise<any>(async (resolve) => {
                                //Now call the mutation to find any faculty by the search value
                                const data =
                                  await subjectMutation.mutateAsync();

                                //If we do have data, set it to the callback,
                                //which is basaically an update function
                                if (data != undefined) {
                                  callback(data);
                                  resolve(true);
                                } else {
                                  //Else instead just set it to nothing
                                  callback([]);
                                  resolve(true);
                                }
                              });
                            }}
                            //Manually pass in the props with values
                            value={value}
                            ref={ref}
                            onChange={(event) => {
                              onChange(event);
                            }}
                            //styles={customStyles}
                          />
                        )}
                      />

                      {/* Error message thrown when zod detects a problem */}
                      <ErrorMessage
                        errors={courseAddForm.formState.errors}
                        name="subject"
                        render={({ message }) => (
                          <p className="font-semibold text-red-600">
                            {message}
                          </p>
                        )}
                      />
                    </div>
                  </div>

                  {/* Div aligns course */}
                  <div className="flex-col" id="courseAlign">
                    <div className="w-50 flex h-8 items-center">
                      <p>Course</p>
                    </div>
                    <div>
                      {/* Course */}
                      <Input
                        type="text"
                        className="h-[38px] w-full"
                        size="sm"
                        {...courseAddForm.register("course_number")}
                      />
                      {/* Error message thrown when zod detects a problem */}
                      <ErrorMessage
                        errors={courseAddForm.formState.errors}
                        name="course_number"
                        render={({ message }) => (
                          <p className="font-semibold text-red-600">
                            {message}
                          </p>
                        )}
                      />
                    </div>
                  </div>

                  {/* div aligns section info */}
                  <div className=" flex-col" id="sectionAlign">
                    <div className="w-50 flex h-8 items-center">
                      <p>Section</p>
                    </div>
                    <div>
                      {/* section info */}
                      <Input
                        type="number"
                        className="h-[38px] w-full"
                        size="sm"
                        min="0"
                        max="100"
                        {...courseAddForm.register("section")}
                      />
                      {/* Error message thrown when zod detects a problem */}
                      <ErrorMessage
                        errors={courseAddForm.formState.errors}
                        name="section"
                        render={({ message }) => (
                          <p className="font-semibold text-red-600">
                            {message}
                          </p>
                        )}
                      />
                    </div>
                  </div>

                  {/* Div aligns faculty */}
                  <div className="grow flex-col" id="facultyAlign">
                    <div className="w-50  flex h-8 items-center">
                      <p>Faculty Member</p>
                    </div>
                    <div>
                      {/* Asynchronous selection, allows to grab data from database and wait for it to come in */}
                      <Controller
                        name="faculty"
                        control={courseAddForm.control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange, ref } }) => (
                          <AsyncSelect
                            isClearable
                            defaultOptions
                            className="w-[250px]"
                            placeholder={"Enter Faculty"}
                            blurInputOnSelect={true}
                            loadOptions={(search, callback) => {
                              //Create promise for the current options being loadded
                              new Promise<any>(async (resolve) => {
                                //Now call the mutation to find any faculty by the search value

                                console.log({
                                  department:
                                    courseAddForm.getValues("department.name"),
                                });

                                const data = await facultyMutation.mutateAsync({
                                  search: search.toLowerCase(),
                                  department:
                                    courseAddForm.getValues("department.name"),
                                });

                                //If we do have data, set it to the callback,
                                //which is basaically an update function
                                if (data != undefined) {
                                  callback(data);
                                  resolve(true);
                                } else {
                                  //Else instead just set it to nothing
                                  callback([]);
                                  resolve(true);
                                }
                              });
                            }}
                            //Manually pass in the props with values
                            value={value}
                            ref={ref}
                            onChange={(event) => {
                              onChange(event);
                            }}
                            //styles={customStyles}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/** List of radio buttons for semsters */}
                <div
                  className="mt-2 flex w-full flex-row space-x-4"
                  id="firstRow"
                >
                  <Radio
                    color="primary"
                    className="mt-2"
                    {...courseAddForm.register("semester")}
                    name="semester"
                    value={Semesters.FALL}
                  />
                  <p className="mt-2">Fall Semester</p>

                  <Radio
                    color="primary"
                    className="mt-2"
                    {...courseAddForm.register("semester")}
                    name="semester"
                    value={Semesters.WINTER}
                  />
                  <p className="mt-2">Winter Semester</p>

                  <Radio
                    color="primary"
                    className="mt-2"
                    {...courseAddForm.register("semester")}
                    name="semester"
                    value={Semesters.SPRING}
                  />
                  <p className="mt-2">Spring Semester</p>

                  <Radio
                    color="primary"
                    className="mt-2"
                    {...courseAddForm.register("semester")}
                    name="semester"
                    value={Semesters.SUMMER}
                  />
                  <p className="mt-2">Summer Semester</p>
                </div>

                {/**
                 * Error Message for when a semester is not selected
                 */}
                <div>
                  <ErrorMessage
                    errors={courseAddForm.formState.errors}
                    name="semester"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                </div>

                {/* header for label and add location button */}
                <div
                  className="mt-4 flex border-t-[1px] border-gray-200 pt-2"
                  id="locationHeader"
                >
                  <div className="grow" id="locationLabel">
                    <p className="font-bold">Time & Locations</p>
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
                          end_time: 1030,
                          start_time: 830,
                          is_online: false,
                          rooms: {
                            room: "",

                            building: null,
                          },
                        });
                      }}
                    >
                      Add Locations
                    </Button>
                  </div>
                </div>

                <div className="mt-2 flex h-[350px] grow flex-col space-y-2 overflow-y-scroll ">
                  {/* field for time input (in 24 hour format) */}
                  {locationFields.fields.map((item, index) => {
                    return (
                      <div
                        className="rounded-md bg-gray-200 p-2"
                        id="informationBLock"
                        key={index}
                      >
                        <div className="flex  space-x-10" id="locationList">
                          {/* Checkboxes for days */}
                          <div className="flex-col items-center justify-end">
                            <br />
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
                            <ErrorMessage
                              errors={courseAddForm.formState.errors}
                              name={`locations.${index}.day_monday`}
                              render={({ message }) => (
                                <p className="font-semibold text-red-600">
                                  {message}
                                </p>
                              )}
                            />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex  items-end justify-end space-x-4">
                              {" "}
                              <div
                                className="flex w-full flex-col"
                                id="starTime"
                              >
                                <div
                                  className="w-50 m-1 flex h-8 "
                                  id="timeLbl"
                                >
                                  <p>Start Time</p>
                                </div>
                                <div
                                  className="flex flex-col"
                                  id="timeInputBoxes"
                                >
                                  {/* Custom Time Input */}
                                  <Controller
                                    control={courseAddForm.control}
                                    name={`locations.${index}.start_time`}
                                    render={({ field }) => {
                                      return (
                                        <TimeInput
                                          {...field}
                                          disabled={
                                            !(
                                              courseAddForm.watch(
                                                `locations.${index}.day_monday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_tuesday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_wednesday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_thursday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_friday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_saturday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_sunday`
                                              )
                                            )
                                          }
                                        />
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="mb-2 flex">
                                <p>to</p>
                              </div>
                              <div
                                className="flex w-full flex-col"
                                id="endTime"
                              >
                                <div
                                  className="w-50 m-1 flex h-8 "
                                  id="timeLbl"
                                >
                                  <p>End Time</p>
                                </div>
                                <div
                                  className="flex flex-col"
                                  id="timeInputBoxes"
                                >
                                  {/* Custom Time Input */}
                                  <Controller
                                    control={courseAddForm.control}
                                    name={`locations.${index}.end_time`}
                                    render={({
                                      field: { onChange, value, name, ref },
                                    }) => {
                                      return (
                                        <TimeInput
                                          ref={ref}
                                          disabled={
                                            !(
                                              courseAddForm.watch(
                                                `locations.${index}.day_monday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_tuesday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_wednesday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_thursday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_friday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_saturday`
                                              ) ||
                                              courseAddForm.watch(
                                                `locations.${index}.day_sunday`
                                              )
                                            )
                                          }
                                          value={value}
                                          onChange={(value) => {
                                            console.log(value);
                                            onChange(value);
                                          }}
                                        />
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
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

                          <div className="flex grow justify-end pr-4">
                            <Button
                              type="button"
                              color="error"
                              size="sm"
                              onClick={() => {
                                locationFields.remove(index);
                              }}
                            >
                              <Trash />
                            </Button>
                          </div>
                        </div>

                        <div
                          className="flex items-center justify-end space-x-2"
                          id="inPerson+Building"
                        >
                          <div className="flex w-[400px] flex-row">
                            <Checkbox
                              className="mr-2 "
                              {...courseAddForm.register(
                                `locations.${index}.is_online`
                              )}
                            />
                            <p>Course Online</p>
                          </div>

                          <div className="w-full flex-col">
                            <div className="w-50 flex h-8 items-center">
                              <p>Building</p>
                            </div>

                            <div className="w-full">
                              <Controller
                                name={`locations.${index}.rooms.building`}
                                control={courseAddForm.control}
                                render={({ field }) => (
                                  <AsyncSelect
                                    isClearable
                                    defaultOptions
                                    className="w-[250px]"
                                    placeholder={"Enter Building"}
                                    isDisabled={courseAddForm.watch(
                                      `locations.${index}.is_online`
                                    )}
                                    loadOptions={(search, callback) => {
                                      new Promise<any>(async (resolve) => {
                                        const data =
                                          await buildingMutation.mutateAsync({
                                            search: search.toLowerCase(),
                                          });
                                        console.log({ locationData: data });
                                        if (data != undefined) {
                                          callback(
                                            data.map((obj) => ({
                                              label: obj.label,
                                              value: obj.value,
                                              buiding_tuid: obj.building_tuid,
                                            }))
                                          );
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
                            </div>
                          </div>

                          <div className="w-full flex-col">
                            <div className="w-50 flex h-8 items-center">
                              <p>Room</p>
                            </div>
                            <div>
                              {/* Room Number */}
                              <Input
                                type="number"
                                className="w-16"
                                size="sm"
                                {...courseAddForm.register(
                                  `locations.${index}.rooms.room`
                                )}
                                disabled={courseAddForm.watch(
                                  `locations.${index}.is_online`
                                )}
                              />

                              {/* Error message thrown when zod detects a problem */}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <ErrorMessage
                    errors={courseAddForm.formState.errors}
                    name="locations"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                </div>
              </div>

              <div
                className="flex w-[250px] grow flex-col justify-between space-y-8  border-l-2 pl-4"
                id="sidebar"
              >
                <div className="grow flex-row text-left" id="1">
                  <p>Changes</p>
                  <Textarea
                    className="h-full w-full grow resize-none"
                    {...courseAddForm.register(`notes.CHANGES`)}
                  />
                </div>
                <div className="grow flex-row text-left" id="2">
                  <p>Academic Affairs</p>
                  <Textarea
                    className="h-full w-full resize-none"
                    {...courseAddForm.register(`notes.ACAMDEMIC_AFFAIRS`)}
                  />
                </div>
                <div className="grow flex-row text-left" id="3">
                  <p>Department</p>
                  <Textarea
                    className="h-full w-full resize-none"
                    {...courseAddForm.register(`notes.DEPARTMENT`)}
                  />
                </div>
              </div>
            </div>
            {/* Submit button */}
            <div className="flex justify-end">
              {isCourseEditing != undefined && (
                <Button
                  color={
                    isCourseEditing.state != CourseState.REMOVED
                      ? "error"
                      : "warning"
                  }
                  onClick={async () => {
                    await removeCourseMutation.mutateAsync({
                      tuid: isCourseEditing.tuid!,
                    });
                    toast.info(
                      isCourseEditing.state != CourseState.REMOVED
                        ? "Course has been removed"
                        : "Course has been restored"
                    );
                    onClose();
                  }}
                  type="button"
                  className="mt-2 mr-2"
                >
                  {isCourseEditing.state != CourseState.REMOVED
                    ? "Delete"
                    : "Recover"}
                </Button>
              )}
              <Button
                color="success"
                type="submit"
                className="mt-2"
                disabled={
                  !(
                    Object.keys(courseAddForm.formState.dirtyFields).length > 0
                  ) as boolean
                }
              >
                {isCourseEditing != undefined ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        )}

        {/* Show an animated spinner while the edited course is loading */}
        {!isCourseEditing && edit != null && (
          <div className="flex h-[200px] w-full flex-col items-center justify-center">
            <AnimatedSpinner />
            <p>Loading...</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CreateCourseModal;
