//Import component libraries and react
import { useCallback, useEffect, useState } from "react";
import { Button, Checkbox, Input, Modal, Select, Table } from "react-daisyui";
import { toast } from "react-toastify";

//Import icons
import { Check, Pencil, Plus, Trash, X } from "tabler-icons-react";

//Import form information
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";

//Import types
import {
  createFacultySchema as createCourseSchema,
  type ICreateFaculty as ICreateCourse,
} from "src/validation/faculty";
import { type GuidelinesFaculty as GuidelinesCourse } from "@prisma/client";

//Import local components
import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";
import PaginationBar from "src/components/Pagination";

//Import backend api
import { api } from "src/utils/api";

const Courses = () => {
  /**
   * Filter values
   * The value which will be searching that is set by the debouncing below
   */
  const [filterSemester, setFilterSemester] = useState<
    "Fall" | "Winter" | "Spring" | "Summer"[]
  >();
  const [filterCredits, setFilterCredits] = useState(4);
  const [filterMeetings, setFilterMeetings] = useState(3);
  const [filterStartTime, setFilterStartTime] = useState<Date>();
  const [filterEndTime, setFilterEndTime] = useState<Date>();
  const [filterDays, setFilterDays] = useState(2);

  /**
   * Pagination
   * Set the current page of the the data shown
   *
   */
  const [currentPage, setCurrentPage] = useState(1);

  //Query all of the data based on the search value

  const courses = api.faculty.getAllFaculty.useQuery({
    page: currentPage,
    search: "",
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
    useState<GuidelinesCourse>();

  /**
   * openDeleteModal
   * Open the deletion modal for the current faculty member
   * @param course
   */
  const openDeleteModal = (course: GuidelinesCourse) => {
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
  const { reset, ...courseForm } = useForm<ICreateCourse>({
    mode: "onBlur",
    resolver: zodResolver(createCourseSchema),
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
  const onCourseModifySubmit = async (data: ICreateCourse) => {
    //Do we have to update said faculty
    console.log("Wooo!");
    console.log(isCourseEditing);

    if (isCourseEditing) {
      const result = await courseUpdateMutation.mutateAsync({
        tuid: isCourseEditing?.tuid,
        ...data,
      });

      if (result) {
        toast.info(`Updated '${data.first_name} ${data.last_name}'`);
      } else {
        toast.error(
          `Failed to add Course '${data.first_name} ${data.last_name}'`
        );
      }
    } else {
      const result = await courseAddMutation.mutateAsync(data);
      if (result) {
        toast.success(
          `Added new course '${data.first_name} ${data.last_name}'`
        );
      } else {
        toast.error(
          `Failed to add course '${data.first_name} ${data.last_name}'`
        );
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
    //Make sure the value of the faculty we want to delete is not undefined
    if (courseDeleteValue != undefined) {
      //Now send the mutation to the server. The server will return
      //A boolean value that either it deleted or it failed to delete
      const response = await courseDeleteMutation.mutateAsync({
        tuid: courseDeleteValue?.tuid,
      });

      //If its true, that's a good!
      if (response) {
        toast.success(
          `Succesfully deleted '${courseDeleteValue?.first_name} ${courseDeleteValue?.last_name}'`,
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        //Else its an error
      } else {
        toast.error(
          `Failed to deleted '${courseDeleteValue?.first_name} ${courseDeleteValue?.last_name}'`,
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
      }
    }
    //Now we just need to reftech the faculty
    courses.refetch();
    //And close the modal
    openCourseDeleteModal(false);
  };

  /**
   * Editing a entry
   *
   * Are we editing a faculty member? If so its null or the faculty object
   */
  const [isCourseEditing, setCourseEditing] = useState<GuidelinesCourse>();

  return (
    <>
      <div className="m-2 flex justify-between ">
        <div>
          <Input onChange={onSearch} placeholder="Search" />
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
                  <span>{course.course_length}</span>
                  <span>
                    {course.times.map((time) => {
                      return <span>{time}</span>;
                    })}
                  </span>
                  <span>{course.days}</span>
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
              totalPageCount={courses.data?.totalPages}
              currentPage={courses.data?.page}
              onClick={(page) => {
                setCurrentPage(page);
              }}
            />
          )}
        </div>
      </div>
      {/* This dialog used for adding a faculty */}
      <Modal
        open={isCourseCreateModalOpen}
        onClickBackdrop={toggleCourseModifyModal}
        className="w-[400px]"
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
                <div className="w-1/2">
                  <p>Credits</p>
                  <Input
                    type="text"
                    className="mt-2 w-full"
                    placeholder="Suffix"
                    {...courseForm.register("credits")}
                  />
                  <ErrorMessage
                    errors={courseForm.formState.errors}
                    name="credits"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                </div>
                <div className="w-1/2">
                  <p>Total Meetings</p>
                  <Input
                    type="text"
                    className="mt-2 w-full"
                    placeholder="First Name"
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
      {/* This dialog for deleting a faculty */}
      <ConfirmDeleteModal
        open={isCourseDeleteModalOpen}
        title="Delete Faculty?"
        message={
          courseDeleteValue
            ? `Are you sure you want delete '${courseDeleteValue?.first_name} ${courseDeleteValue?.last_name}'?`
            : "Error"
        }
        onClose={() => {
          openCourseDeleteModal(false);
        }}
        onConfirm={deleteCourse}
      />
    </>
  );
};

export default Courses;
