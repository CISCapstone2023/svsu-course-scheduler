//Import component libraries and react
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Dropdown,
  Input,
  Modal,
  Select,
  Table,
} from "react-daisyui";
import { toast } from "react-toastify";

//Import icons
import {
  CaretDown,
  Check,
  Pencil,
  Plus,
  TransitionRight,
  Trash,
  X,
} from "tabler-icons-react";

//Import form information
import { useFieldArray, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce, min } from "lodash";

//Import types
import {
  addGuidelineSchema,
  type IAddGuidelineCourse,
} from "src/validation/courses";
import { type GuidelinesFaculty as GuidelinesCourse } from "@prisma/client";

//Import local components
import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";
import PaginationBar from "src/components/Pagination";

//Import backend api
import { api } from "src/utils/api";
import { CourseGuidelinesTimeAndDays } from "src/server/api/routers/courses";

const Courses = () => {
  /**
   * Filter values
   * The value which will be searching that is set by the debouncing below
   */
  const [filterFallSemester, setFilterFallSemester] = useState(true);
  const [filterWinterSemester, setFilterWinterSemester] = useState(true);
  const [filterSpringSemester, setFilterSpringSemester] = useState(true);
  const [filterSummerSemester, setFilterSummerSemester] = useState(true);

  const [filterSemesterDropdown, setFilterSemesterDropdown] = useState(false);

  const [filterCreditsMax, setFilterCreditsMax] = useState(4);
  const [filterCreditsMin, setFilterCreditsMin] = useState(1);

  const [filterMeetingsMax, setFilterMeetingsMax] = useState(4);
  const [filterMeetingsMin, setFilterMeetingsMin] = useState(1);

  const [filterStartTimeHour, setFilterStartTimeHour] = useState(8);
  const [filterStartTimeMinute, setFilterStartTimeMinute] = useState(30);

  const [filterEndTimeHour, setFilterEndTimeHour] = useState(22);
  const [filterEndTimeMinute, setFilterEndTimeMinute] = useState(5);

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
    page: 1,
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
      min: 1,
      max: 4,
    },
    meeting_total: { min: 1, max: 4 },
    //search: "",
    end_time: 20_30,
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
    useState<CourseGuidelinesTimeAndDays>();

  /**
   * openDeleteModal
   * Open the deletion modal for the current faculty member
   * @param course
   */
  const openDeleteModal = (course: CourseGuidelinesTimeAndDays) => {
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
  const { reset, ...courseForm } = useForm<CourseGuidelinesTimeAndDays>({
    mode: "onBlur",
    resolver: zodResolver(addGuidelineSchema),
  });

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
    setCourseEditing(undefined);
    openCourseCreateModal(!isCourseCreateModalOpen);
    reset({});
  };

  //Grab the mutations from the backend for adding, updating, and deleting
  const courseAddMutation = api.faculty.addFaculty.useMutation();
  const courseUpdateMutation = api.faculty.updateFaculty.useMutation();
  const courseDeleteMutation = api.faculty.deleteOneFaculty.useMutation();

  /**
   * onCampusModifySubmit
   * A useCallback which will only update on change of the mutation.
   * Parameters are passed through the reference
   */
  const onCourseModifySubmit = async (data: IAddGuidelineCourse) => {
    //Do we have to update said faculty
    console.log("Wooo!");
    console.log(isCourseEditing);

    if (isCourseEditing) {
      // const result = await courseUpdateMutation.mutateAsync({
      //   tuid: isCourseEditing?.tuid,
      //   ...data,
      // });
      //   if (result) {
      //     toast.info(`Updated '${data.first_name} ${data.last_name}'`);
      //   } else {
      //     toast.error(
      //       `Failed to add Course '${data.first_name} ${data.last_name}'`
      //     );
      //   }
      // } else {
      //   const result = await courseAddMutation.mutateAsync(data);
      //   if (result) {
      //     toast.success(
      //       `Added new course '${data.first_name} ${data.last_name}'`
      //     );
      //   } else {
      //     toast.error(
      //       `Failed to add course '${data.first_name} ${data.last_name}'`
      //     );
      //   }
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
    if (courseDeleteValue != undefined) {
      //Now send the mutation to the server. The server will return
      //A boolean value that either it deleted or it failed to delete
      const response = await courseDeleteMutation.mutateAsync({
        tuid: courseDeleteValue?.tuid,
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
  const [isCourseEditing, setCourseEditing] =
    useState<CourseGuidelinesTimeAndDays>();

  // function for splitting course times
  const militaryToTime = (time: number) => {
    //initializes hour variable to parse integer time numbers
    let hour =
      parseInt(
        time >= 1000
          ? time.toString().substring(0, 2) //splits numbers of time to get ending numbers of set time
          : time.toString().substring(0, 1) // splits numbers of time to get begining numbers of set time
      ) % 12; // mods time to convert from military time to standard time

    // conditional statement to reset hours to 12 if initial time is 12 since 12 mod 12 returns zero
    if (hour == 0) {
      hour = 12;
    }

    //initializes constant for getting the minutes of time
    const minute = time.toString().substring(time.toString().length - 2);

    //initializes constant to be used for AM/PM tagging on time
    const anteMeridiem = time >= 1300 ? "PM" : "AM";
    return {
      hour,
      minute,
      anteMeridiem,
    };
  };
  return (
    <>
      <div className="m-2 flex justify-between ">
        <div className="flex space-x-2">
          <Dropdown>
            <Button
              onClick={() => {
                setFilterSemesterDropdown(true);
              }}
            >
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
            Add Course
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
                  <span>course legnth 1 hour</span>
                  <span>
                    {course.times.map((time) => {
                      return (
                        <>
                          <span key={time.tuid}>
                            {militaryToTime(time.start_time).hour}:
                            {militaryToTime(time.start_time).minute}{" "}
                            {militaryToTime(time.start_time).anteMeridiem}
                            {} to {militaryToTime(time.end_time).hour}:
                            {militaryToTime(time.end_time).minute}{" "}
                            {militaryToTime(time.end_time).anteMeridiem}
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
            No faculty found!
            <div>
              <Button onClick={toggleCourseModifyModal} className="mt-2">
                <Plus />
                Add Course
              </Button>
            </div>
             
          </div>
        )}
        <div className="flex w-full justify-center p-2">
          {courses.data != undefined && (
            <PaginationBar
              totalPageCount={0}
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
        className="h-full  w-11/12 max-w-5xl"
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
                    {...courseForm.register("credits")}
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
                    {...courseForm.register("meeting_amount")}
                  />
                  <ErrorMessage
                    errors={courseForm.formState.errors}
                    name="meeting_amount"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                </div>
                <div className="w-1/3">
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
                            tuid: "",
                            guideline_id: "",
                          });
                        }}
                      >
                        {" "}
                        Add Time
                      </Button>
                    </div>
                  </div>

                  {dayFields.fields.map(() => {
                    return (
                      <>
                        {" "}
                        <div className="m-2 flex flex-row items-center justify-center space-x-2 rounded-md bg-base-200 p-4">
                          <div>
                            <p>Start Time</p>
                            <Input
                              className="w-20"
                              type="number"
                              placeholder="Hour"
                            />{" "}
                            <Input
                              className="w-20"
                              type="number"
                              placeholder="Minute"
                            />
                          </div>
                          <div>
                            <p>End Time</p>
                            <Input
                              className="w-20"
                              type="number"
                              placeholder="Hour"
                            />{" "}
                            <Input
                              className="w-20"
                              type="number"
                              placeholder="Minute"
                            />
                          </div>
                          <div>
                            <Button color="error">
                              <Trash />
                            </Button>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </div>
                <div className="w-1/3">
                  <div className="flex">
                    <div className="grow">
                      <p>Days</p>
                    </div>
                    <div>
                      <Button size="xs"> Add Day </Button>
                    </div>
                  </div>
                </div>
              </div>

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
                name="is_adjunct"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
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
