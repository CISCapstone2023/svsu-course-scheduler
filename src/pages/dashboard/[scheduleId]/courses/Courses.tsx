//Import component libraries and react
import { Fragment, useCallback, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Dropdown,
  Input,
  Modal,
  Table,
} from "react-daisyui";
import { toast } from "react-toastify";

//Import icons
import { CaretDown, Pencil, Plus, Trash } from "tabler-icons-react";

//Import form information
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";

//Import types
import {
  guidelineCourseAddSchema,
  type IGuidelineCourseAdd,
} from "src/validation/courses";

//Import local components
import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";
import PaginationBar from "src/components/Pagination";

//Import backend api
import { api } from "src/utils/api";
import TimeInput from "../schedule/TimeInput";

const seen: any[] = [];

const Courses = () => {
  /**
   * Filter values
   * The value which will be searching that is set by the debouncing below
   */

  //Filter the semesters
  const [filterFallSemester, setFilterFallSemester] = useState(true);
  const [filterWinterSemester, setFilterWinterSemester] = useState(true);
  const [filterSpringSemester, setFilterSpringSemester] = useState(true);
  const [filterSummerSemester, setFilterSummerSemester] = useState(true);

  //Filter the credits
  const [filterCreditsMax, setFilterCreditsMax] = useState(4);
  const [filterCreditsMin, setFilterCreditsMin] = useState(1);

  //Filter the meeting amount
  const [filterMeetingsMax, setFilterMeetingsMax] = useState(4);
  const [filterMeetingsMin, setFilterMeetingsMin] = useState(1);

  //TODO: Possible add the time filters, possibly
  const [filterStartTimeHour, setFilterStartTimeHour] = useState(8);
  const [filterStartTimeMinute, setFilterStartTimeMinute] = useState(30);

  const [filterEndTimeHour, setFilterEndTimeHour] = useState(22);
  const [filterEndTimeMinute, setFilterEndTimeMinute] = useState(5);

  //Filter the days
  const [filterDaysMonday, setFilterDaysMonday] = useState(true);
  const [filterDaysTuesday, setFilterDaysTuesday] = useState(true);
  const [filterDaysWednesday, setFilterDaysWednesday] = useState(true);
  const [filterDaysThursday, setFilterDaysThursday] = useState(true);
  const [filterDaysFriday, setFilterDaysFriday] = useState(true);
  const [filterDaysSaturday, setFilterDaysSaturday] = useState(true);
  const [filterDaysSunday, setFilterDaysSunday] = useState(true);

  /**
   * Pagination
   * Set the current page of the the data shown
   *
   */
  const [currentPage, setCurrentPage] = useState(1);

  //Query all of the data based on the search value

  const courses = api.courses.getAllCourseGuidelines.useQuery({
    page: currentPage,
    days: {
      monday: filterDaysMonday,
      tuesday: filterDaysTuesday,
      wednesday: filterDaysWednesday,
      thursday: filterDaysThursday,
      friday: filterDaysFriday,
      saturday: filterDaysSaturday,
      sunday: filterDaysSunday,
    },
    semester_fall: filterFallSemester,
    semester_winter: filterWinterSemester,
    semester_spring: filterSpringSemester,
    semester_summer: filterSummerSemester,
    credits: {
      min: filterCreditsMin,
      max: filterCreditsMax,
    },
    meeting_total: { min: filterMeetingsMin, max: filterMeetingsMax },
    //search: "",
    end_time: 23_59,
    start_time: 0,
  });

  //The function that gets called when a input event has occured.
  //It passthe the React Change Event which has a input element
  //This called the waitForSearch debounced callback that is below
  async function onSearch(e: React.ChangeEvent<HTMLInputElement>) {
    waitForSearch(e.currentTarget.value);
  }

  //Create a callback to hold a single instance of a debounce
  const waitForSearch = useCallback(
    //The value that is passed in the callback is directly passed into the function
    //and because debounced does the same thing it will pass the value to its parameter which
    //is an arrow function
    debounce((value: string) => {
      //Now we actually update the search so we don't keep fetching the server
      // setSearchValue(value);
      //Also reset the page the user is on
      setCurrentPage(1);
    }, 500), //This waits 500 ms (half a second) before the function inside (aka above) gets called
    []
  );

  /**
   * Modals
   *
   * Show and confirm users for the adding,editing,and deleting
   */

  //CREATE MODAL
  const [isCourseCreateModalOpen, openCourseCreateModal] =
    useState<boolean>(false);

  //DELETE MODAL
  const [isCourseDeleteModalOpen, openCourseDeleteModal] =
    useState<boolean>(false);
  const [courseDeleteValue, setCourseDeleteValue] =
    useState<IGuidelineCourseAdd>();

  /**
   * openDeleteModal
   * Open the deletion modal for the current faculty member
   * @param course
   */
  const openDeleteModal = (course: IGuidelineCourseAdd) => {
    setCourseDeleteValue(course);
    openCourseDeleteModal(true);
  };
  /**
   * useForm
   * This creates a new form using the react-form-hooks.
   *
   * This form hook will provide all the needed function to validate and parse
   * the data on the form
   */
  const { reset, ...courseForm } = useForm<IGuidelineCourseAdd>({
    mode: "onChange",
    resolver: zodResolver(guidelineCourseAddSchema),
  });

  //Array fields from the form
  const dayFields = useFieldArray({
    name: "days",
    control: courseForm.control,
  });

  const timeFields = useFieldArray({
    name: "times",
    control: courseForm.control,
  });

  const toggleCourseModifyModal = () => {
    //Reset the form so we can add (or edit a new user)
    reset({});
    setCourseEditing(undefined);
    openCourseCreateModal(!isCourseCreateModalOpen);
    reset({});
  };

  //Grab the mutations from the backend for adding, updating, and deleting
  const courseAddMutation = api.courses.addCourseGuideline.useMutation();
  const courseUpdateMutation = api.courses.updateCourseGuideline.useMutation();
  const courseDeleteMutation = api.courses.deleteCourseGuideline.useMutation();

  /**
   * onCampusModifySubmit
   * A useCallback which will only update on change of the mutation.
   * Parameters are passed through the reference
   */
  const onCourseModifySubmit = async (data: IGuidelineCourseAdd) => {
    if (isCourseEditing != undefined && isCourseEditing!.tuid) {
      const result = await courseUpdateMutation.mutateAsync({
        tuid: isCourseEditing!.tuid,
        ...data,
      });
      if (result) {
        toast.info(`Updated Course Guideline`);
      } else {
        toast.error(`Failed to add Course Guideline`);
      }
    } else {
      const result = await courseAddMutation.mutateAsync(data);
      if (result) {
        toast.success(`Added new course guidline`);
      } else {
        toast.error(`Failed to add course guideline`);
      }
    }

    //Update the list after either an add or edit
    courses.refetch();
    //Toggle the modal so it no longer shows on the screen
    openCourseCreateModal(false);
  };

  /**
   * deleteFaculty
   * Delete a faculty based on tuid that is in the facultyDeleteValue
   */
  const deleteCourse = async () => {
    //Make sure the value of the course we want to delete is not undefined
    if (courseDeleteValue != undefined && courseDeleteValue!.tuid) {
      //Now send the mutation to the server. The server will return
      //A boolean value that either it deleted or it failed to delete
      const response = await courseDeleteMutation.mutateAsync({
        tuid: courseDeleteValue.tuid,
      });

      //If its true, that's a good!
      if (response) {
        toast.success(`Succesfully deleted `, {
          position: toast.POSITION.TOP_RIGHT,
        });
        //Else its an error
      } else {
        toast.error(`Failed to delete`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }
    //Now we just need to refetch the course
    courses.refetch();
    //And close the modal
    openCourseDeleteModal(false);
  };

  /**
   * Editing a entry
   *
   * Are we editing a faculty member? If so its null or the faculty object
   */
  const [isCourseEditing, setCourseEditing] = useState<IGuidelineCourseAdd>();

  console.log(
    JSON.stringify(courseForm.formState.errors, function (key, val) {
      if (val != null && typeof val == "object") {
        if (seen.indexOf(val) >= 0) {
          return;
        }
        seen.push(val);
      }
      return val;
    })
  );

  // function for splitting course times
  return (
    <>
      <div className="m-2 flex justify-between ">
        <div className="flex space-x-2">
          <Dropdown>
            <Button>
              Semester
              <CaretDown />
            </Button>
            <Dropdown.Menu>
              <Card.Body>
                <div className="flex space-x-4">
                  <p>Fall</p>
                  <Checkbox
                    checked={filterFallSemester}
                    onChange={(e) => {
                      setFilterFallSemester(e.currentTarget.checked);
                    }}
                  />
                </div>
                <div className="flex">
                  <p>Winter</p>
                  <Checkbox
                    checked={filterWinterSemester}
                    onChange={(e) => {
                      setFilterWinterSemester(e.currentTarget.checked);
                    }}
                  />
                </div>
                <div className="flex">
                  <p>Spring</p>
                  <Checkbox
                    checked={filterSpringSemester}
                    onChange={(e) => {
                      setFilterSpringSemester(e.currentTarget.checked);
                    }}
                  />
                </div>
                <div className="flex space-x-4">
                  <p>Summer</p>
                  <Checkbox
                    checked={filterSummerSemester}
                    onChange={(e) => {
                      setFilterSummerSemester(e.currentTarget.checked);
                    }}
                  />
                </div>
              </Card.Body>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown>
            <Button>
              Credits
              <CaretDown />
            </Button>
            <Dropdown.Menu>
              <Card.Body>
                <p>Min Credits</p>
                <Input
                  onChange={(e) => {
                    setFilterCreditsMin(parseInt(e.currentTarget.value));
                  }}
                  value={filterCreditsMin}
                  className="w-36"
                  type="number"
                  placeholder="Min Credits"
                />
                <p>Max Credits</p>
                <Input
                  onChange={(e) => {
                    setFilterCreditsMax(parseInt(e.currentTarget.value));
                  }}
                  value={filterCreditsMax}
                  className="w-36"
                  type="number"
                  placeholder="Max Credits"
                />
              </Card.Body>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown>
            <Button>
              Meetings
              <CaretDown />
            </Button>
            <Dropdown.Menu>
              <Card.Body>
                <p>Min Meeting Amount</p>
                <Input
                  onChange={(e) => {
                    setFilterMeetingsMin(parseInt(e.currentTarget.value));
                  }}
                  value={filterMeetingsMin}
                  className="w-38"
                  type="number"
                  placeholder="Min Meetings"
                />
                <p>Max Meeting Amount</p>
                <Input
                  onChange={(e) => {
                    setFilterMeetingsMax(parseInt(e.currentTarget.value));
                  }}
                  value={filterMeetingsMax}
                  className="w-38"
                  type="number"
                  placeholder="Max Meetings"
                />
              </Card.Body>
            </Dropdown.Menu>
          </Dropdown>
          <ButtonGroup>
            <Button
              onClick={() => {
                setFilterDaysMonday(!filterDaysMonday);
              }}
              active={filterDaysMonday}
            >
              M
            </Button>
            <Button
              onClick={() => {
                setFilterDaysTuesday(!filterDaysTuesday);
              }}
              active={filterDaysTuesday}
            >
              T
            </Button>
            <Button
              onClick={() => {
                setFilterDaysWednesday(!filterDaysWednesday);
              }}
              active={filterDaysWednesday}
            >
              W
            </Button>
            <Button
              onClick={() => {
                setFilterDaysThursday(!filterDaysThursday);
              }}
              active={filterDaysThursday}
            >
              TH
            </Button>
            <Button
              onClick={() => {
                setFilterDaysFriday(!filterDaysFriday);
              }}
              active={filterDaysFriday}
            >
              F
            </Button>
            <Button
              onClick={() => {
                setFilterDaysSaturday(!filterDaysSaturday);
              }}
              active={filterDaysSaturday}
            >
              SAT
            </Button>
            <Button
              onClick={() => {
                setFilterDaysSunday(!filterDaysSunday);
              }}
              active={filterDaysSunday}
            >
              SUN
            </Button>
          </ButtonGroup>
        </div>
        <div>
          <Button
            onClick={() => {
              toggleCourseModifyModal();
            }}
          >
            <Plus />
            Add Course Guideline
          </Button>
        </div>
      </div>
      <div className="h-ful m-2 overflow-x-hidden">
        <Table className="w-full shadow-lg" zebra={true}>
          <Table.Head>
            <span />
            <div className="grow">Credits</div>
            <div className="grow">Total Meetings</div>
            <div className="grow">Course Length</div>
            <div>Times</div>
            <div>Days</div>
            <div>Edit</div>
            <div>Delete</div>
          </Table.Head>

          <Table.Body>
            {courses.data?.result.map((course, i) => {
              return (
                <Table.Row key={i}>
                  <span>{i + 1}</span>
                  <span>{course.credits}</span>
                  <span>{course.meeting_amount}</span>
                  <span>
                    {course.times.map((time) => {
                      return (
                        <>
                          <span key={time.tuid}>
                            {time.difference.hours} hours{" "}
                            {time.difference.minutes} minutes
                          </span>
                          <br />
                        </>
                      );
                    })}
                  </span>
                  <span>
                    {course.times.map((time) => {
                      return (
                        <>
                          <span key={time.tuid}>
                            {time.start_time_meta.anteMeridiemHour}:
                            {time.start_time_meta.minute == 0
                              ? "00"
                              : time.start_time_meta.minute}{" "}
                            {time.start_time_meta.anteMeridiem}
                            {} to {time.end_time_meta.anteMeridiemHour}:
                            {time.end_time_meta.minute == 0
                              ? "00"
                              : time.end_time_meta.minute}{" "}
                            {time.end_time_meta.anteMeridiem}
                          </span>
                          <br />
                        </>
                      );
                    })}
                  </span>
                  <span>
                    {course.days.map((day) => {
                      return (
                        <>
                          <span key={day.tuid}>
                            {day.day_monday ? "M" : null}{" "}
                            {day.day_tuesday ? "T" : null}{" "}
                            {day.day_wednesday ? "W" : null}{" "}
                            {day.day_thursday ? "TH" : null}{" "}
                            {day.day_friday ? "F" : null}{" "}
                            {day.day_saturday ? "SAT" : null}{" "}
                            {day.day_sunday ? "SUN" : null}{" "}
                          </span>
                          <br />
                        </>
                      );
                    })}
                  </span>
                  <div className="hover:cursor-pointer">
                    <Button
                      color="warning"
                      onClick={() => {
                        toggleCourseModifyModal();
                        setCourseEditing(course);
                        reset(course);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </div>
                  <div className="hover:cursor-pointer">
                    <Button
                      onClick={() => {
                        openDeleteModal(course);
                      }}
                      color="error"
                    >
                      <Trash />
                    </Button>
                  </div>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        {courses.data?.result.length == 0 && (
          <div className="flex h-[200px] w-full flex-col items-center justify-center">
            No Course Found!
            <div>
              <Button onClick={toggleCourseModifyModal} className="mt-2">
                <Plus />
                Add Course Guideline
              </Button>
            </div>
             
          </div>
        )}
        <div className="flex w-full justify-center p-2">
          {courses.data != undefined && (
            <PaginationBar
              totalPageCount={courses.data?.totalPages}
              currentPage={courses.data?.page}
              onClick={(page) => {
                setCurrentPage(page);
              }}
            />
          )}
        </div>
      </div>
      {/* This dialog used for adding a course */}
      <Modal
        open={isCourseCreateModalOpen}
        onClickBackdrop={toggleCourseModifyModal}
        className=" w-11/12 max-w-5xl"
      >
        <Button
          size="sm"
          shape="circle"
          className="absolute right-2 top-2"
          onClick={toggleCourseModifyModal}
        >
          ✕
        </Button>
        <Modal.Header className="font-bold">
          {isCourseEditing != undefined ? "Edit" : "Add"} Course
        </Modal.Header>

        <Modal.Body>
          <form
            onSubmit={courseForm.handleSubmit(onCourseModifySubmit)}
            className="flex flex-col"
          >
            <div>
              <div className="flex w-full space-x-2">
                <div className="w-1/3">
                  <p>Credits</p>
                  <Input
                    type="text"
                    className="mt-2 w-full"
                    placeholder="Credit Hours"
                    {...courseForm.register("credits", {
                      setValueAs: (v) => (v === "" ? undefined : parseInt(v)),
                    })}
                  />
                  <ErrorMessage
                    errors={courseForm.formState.errors}
                    name="credits"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                  <p>Total Meetings</p>
                  <Input
                    type="text"
                    className="mt-2 w-full"
                    placeholder="Meetings per week"
                    {...courseForm.register("meeting_amount", {
                      setValueAs: (v) => (v === "" ? undefined : parseInt(v)),
                    })}
                  />
                  <ErrorMessage
                    errors={courseForm.formState.errors}
                    name="meeting_amount"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />{" "}
                  <p className="mt-2">Fall Semester</p>
                  <Checkbox
                    color="primary"
                    className="mt-2"
                    {...courseForm.register("semester_fall")}
                  />
                  <p className="mt-2">Winter Semester</p>
                  <Checkbox
                    color="primary"
                    className="mt-2"
                    {...courseForm.register("semester_winter")}
                  />
                  <p className="mt-2">Spring Semester</p>
                  <Checkbox
                    color="primary"
                    className="mt-2"
                    {...courseForm.register("semester_spring")}
                  />
                  <p className="mt-2">Summer Semester</p>
                  <Checkbox
                    color="primary"
                    className="mt-2"
                    {...courseForm.register("semester_summer")}
                  />
                  <ErrorMessage
                    errors={courseForm.formState.errors}
                    name="tuid"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                </div>
                <div className="w-1/3  border-l-2 pl-2">
                  <div className="flex">
                    <div className="grow">
                      <p>Times</p>
                    </div>
                    <div>
                      <Button
                        size="xs"
                        onClick={() => {
                          timeFields.append({
                            end_time: 830,
                            start_time: 1020,
                          });
                        }}
                        type="button"
                      >
                        {" "}
                        Add Time
                      </Button>
                    </div>
                  </div>
                  <ErrorMessage
                    errors={courseForm.formState.errors}
                    name="times"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                  <div className="h-[400px] overflow-scroll">
                    {timeFields.fields.map((item, index) => {
                      return (
                        <>
                          <div
                            key={index}
                            className="m-2 flex flex-row space-x-2 rounded-md bg-base-200 p-2"
                          >
                            <div className="  grow items-center justify-center">
                              <div>
                                <p>Start Time</p>
                                <Controller
                                  control={courseForm.control}
                                  name={`times.${index}.start_time`}
                                  render={({ field }) => {
                                    return <TimeInput {...field} />;
                                  }}
                                />
                              </div>
                              <div>
                                <p>End Time</p>
                                <Controller
                                  control={courseForm.control}
                                  name={`times.${index}.end_time`}
                                  render={({ field }) => {
                                    return <TimeInput {...field} />;
                                  }}
                                />
                                <ErrorMessage
                                  errors={courseForm.formState.errors}
                                  name={`times.${index}.tuid`}
                                  render={({ message }) => (
                                    <p className="font-semibold text-red-600">
                                      {message}
                                    </p>
                                  )}
                                />
                              </div>
                            </div>
                            <div>
                              <Button
                                type="button"
                                color="error"
                                size="sm"
                                onClick={() => {
                                  timeFields.remove(index);
                                }}
                              >
                                <Trash />
                              </Button>
                            </div>
                          </div>
                        </>
                      );
                    })}
                  </div>
                </div>
                <div className="w-1/3 border-l-2 pl-2">
                  <div className="flex">
                    <div className="grow">
                      <div className="justify-center">
                        <p>Days</p>
                      </div>
                    </div>
                    {/* <div className="btn-group btn-group-vertical">
                      <button className="btn-active btn">Monday</button>
                      <button className="btn">Tuesday</button>
                      <button className="btn">Wednesday</button>
                      <button className="btn">Thursday</button>
                      <button className="btn">Friday</button>
                      <button className="btn">Saturday</button>
                      <button className="btn">Sunday</button>
                    </div> */}
                    <div>
                      <Button
                        type="button"
                        size="xs"
                        onClick={() => {
                          dayFields.append({
                            day_monday: false,
                            day_tuesday: false,
                            day_wednesday: false,
                            day_thursday: false,
                            day_friday: false,
                            day_saturday: false,
                            day_sunday: false,
                          });
                        }}
                      >
                        {" "}
                        Add Day
                      </Button>
                    </div>
                  </div>
                  <ErrorMessage
                    errors={courseForm.formState.errors}
                    name="days"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                  <div className="h-[400px] overflow-scroll">
                    {dayFields.fields.map((item, index) => {
                      return (
                        <>
                          <div
                            key={index}
                            className="m-2 flex flex-col rounded-md bg-base-200 p-2"
                          >
                            <div className="space-x- flex">
                              <div className="flex grow items-center justify-center space-x-2">
                                <div className="text-center">
                                  <p>M</p>
                                  <Checkbox
                                    {...courseForm.register(
                                      `days.${index}.day_monday`
                                    )}
                                  />
                                </div>
                                <div className="text-center">
                                  <p>T</p>
                                  <Checkbox
                                    {...courseForm.register(
                                      `days.${index}.day_tuesday`
                                    )}
                                  />
                                </div>
                                <div className="text-center">
                                  <p>W</p>
                                  <Checkbox
                                    {...courseForm.register(
                                      `days.${index}.day_wednesday`
                                    )}
                                  />
                                </div>
                                <div className="text-center">
                                  <p>TH</p>
                                  <Checkbox
                                    {...courseForm.register(
                                      `days.${index}.day_thursday`
                                    )}
                                  />
                                </div>
                                <div className="text-center">
                                  <p>F</p>
                                  <Checkbox
                                    {...courseForm.register(
                                      `days.${index}.day_friday`
                                    )}
                                  />
                                </div>
                                <div className="text-center">
                                  <p>SAT</p>
                                  <Checkbox
                                    {...courseForm.register(
                                      `days.${index}.day_saturday`
                                    )}
                                  />
                                </div>
                                <div className="text-center">
                                  <p>SUN</p>
                                  <Checkbox
                                    {...courseForm.register(
                                      `days.${index}.day_sunday`
                                    )}
                                  />
                                </div>
                              </div>
                              <div>
                                <Button color="error" size="sm" type="button">
                                  <Trash />
                                </Button>
                              </div>
                            </div>
                            <ErrorMessage
                              errors={courseForm.formState.errors}
                              name={`days.${index}.tuid`}
                              render={({ message }) => (
                                <p className="font-semibold text-red-600">
                                  {message}
                                </p>
                              )}
                            />
                          </div>
                        </>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button color="success" type="submit" className="mt-2">
                {isCourseEditing != undefined ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* This dialog for deleting a course */}
      <ConfirmDeleteModal
        open={isCourseDeleteModalOpen}
        title="Delete Course?"
        message={courseDeleteValue ? `Are you sure you want delete` : "Error"}
        onClose={() => {
          openCourseDeleteModal(false);
        }}
        onConfirm={deleteCourse}
      />
    </>
  );
};

export default Courses;
