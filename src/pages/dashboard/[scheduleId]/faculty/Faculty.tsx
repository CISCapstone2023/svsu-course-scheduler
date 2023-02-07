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
  createFacultySchema,
  type ICreateFaculty,
} from "src/validation/faculty";
import { type GuidelinesFaculty } from "@prisma/client";

//Import local components
import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";
import PaginationBar from "src/components/Pagination";

//Import backend api
import { api } from "src/utils/api";

const Faculty = () => {
  /**
   * Search Value
   * The value which will be searching that is set by the debouncing below
   */
  const [searchValue, setSearchValue] = useState<string>("");

  /**
   * Pagination
   * Set the current page of the the data shown
   *
   */
  const [currentPage, setCurrentPage] = useState(1);

  //Query all of the data based on the search value

  const faculties = api.faculty.getAllFaculty.useQuery({
    page: currentPage,
    search: searchValue,
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
      setSearchValue(value);
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
  const [isFacultyCreateModalOpen, openFacultyCreateModal] =
    useState<boolean>(false);

  //DELETE MODAL
  const [isFacultyDeleteModalOpen, openFacultyDeleteModal] =
    useState<boolean>(false);
  const [facultyDeleteValue, setFacultyDeleteValue] =
    useState<GuidelinesFaculty>();

  /**
   * openDeleteModal
   * Open the deletion modal for the current faculty member
   * @param faculty
   */
  const openDeleteModal = (faculty: GuidelinesFaculty) => {
    setFacultyDeleteValue(faculty);
    openFacultyDeleteModal(true);
  };
  /**
   * useForm
   * This creates a new form using the react-form-hooks.
   *
   * This form hook will provide all the needed function to validate and parse
   * the data on the form
   */
  const { reset, ...facultyForm } = useForm<ICreateFaculty>({
    mode: "onBlur",
    resolver: zodResolver(createFacultySchema),
  });

  const toggleFacultyModifyModal = () => {
    //Reset the form so we can add (or edit a new user)
    setFacultyEditing(undefined);
    openFacultyCreateModal(!isFacultyCreateModalOpen);
    reset({});
  };

  //Grab the mutations from the backend for adding, updating, and deleting
  const facultyAddMutation = api.faculty.addFaculty.useMutation();
  const facultyUpdateMutation = api.faculty.updateFaculty.useMutation();
  const facultyDeleteMutation = api.faculty.deleteOneFaculty.useMutation();

  /**
   * onCampusModifySubmit
   * A useCallback which will only update on change of the mutation.
   * Parameters are passed through the reference
   */
  const onFacultyModifySubmit = async (data: ICreateFaculty) => {
    //Do we have to update said faculty
    console.log("Wooo!");
    console.log(isFacultyEditing);

    if (isFacultyEditing) {
      const result = await facultyUpdateMutation.mutateAsync({
        tuid: isFacultyEditing?.tuid,
        ...data,
      });

      if (result) {
        toast.info(`Updated '${data.first_name} ${data.last_name}'`);
      } else {
        toast.error(
          `Failed to add faculty '${data.first_name} ${data.last_name}'`
        );
      }
    } else {
      const result = await facultyAddMutation.mutateAsync(data);
      if (result) {
        toast.success(
          `Added new faculty '${data.first_name} ${data.last_name}'`
        );
      } else {
        toast.error(
          `Failed to add faculty '${data.first_name} ${data.last_name}'`
        );
      }
    }

    //Update the list after either an add or edit
    faculties.refetch();
    //Toggle the modal so it no longer shows on the screen
    openFacultyCreateModal(false);
  };

  /**
   * deleteFaculty
   * Delete a faculty based on tuid that is in the facultyDeleteValue
   */
  const deleteFaculty = async () => {
    //Make sure the value of the faculty we want to delete is not undefined
    if (facultyDeleteValue != undefined) {
      //Now send the mutation to the server. The server will return
      //A boolean value that either it deleted or it failed to delete
      const response = await facultyDeleteMutation.mutateAsync({
        tuid: facultyDeleteValue?.tuid,
      });

      //If its true, that's a good!
      if (response) {
        toast.success(
          `Succesfully deleted '${facultyDeleteValue?.first_name} ${facultyDeleteValue?.last_name}'`,
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        //Else its an error
      } else {
        toast.error(
          `Failed to deleted '${facultyDeleteValue?.first_name} ${facultyDeleteValue?.last_name}'`,
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
      }
    }
    //Now we just need to reftech the faculty
    faculties.refetch();
    //And close the modal
    openFacultyDeleteModal(false);
  };

  /**
   * Editing a entry
   *
   * Are we editing a faculty member? If so its null or the faculty object
   */
  const [isFacultyEditing, setFacultyEditing] = useState<GuidelinesFaculty>();

  return (
    <>
      <div className="m-2 flex justify-between ">
        <div>
          <Input onChange={onSearch} placeholder="Search" />
        </div>
        <div>
          <Button
            onClick={() => {
              toggleFacultyModifyModal();
            }}
          >
            <Plus />
            Add Faculty
          </Button>
        </div>
      </div>
      <div className="h-ful m-2 overflow-x-hidden">
        <Table className="w-full shadow-lg" zebra={true}>
          <Table.Head>
            <span />
            <div className="grow">First Name</div>
            <div className="grow">Last Name</div>
            <div className="grow">Email</div>
            <div>Is Adjunct?</div>
            <div>Edit</div>
            <div>Delete</div>
          </Table.Head>

          <Table.Body>
            {faculties.data?.result.map((faculty, i) => {
              return (
                <Table.Row key={i}>
                  <span>{i + 1}</span>
                  <span>{faculty.first_name}</span>
                  <span>{faculty.last_name}</span>
                  <span>{faculty.email}</span>
                  <span>
                    {faculty.is_adjunct && (
                      <Check className="text-green-400" size={40} />
                    )}
                    {!faculty.is_adjunct && (
                      <X className="text-red-400" size={40} />
                    )}
                  </span>
                  <div className="hover:cursor-pointer">
                    <Button
                      color="warning"
                      onClick={() => {
                        toggleFacultyModifyModal();
                        setFacultyEditing(faculty);
                        reset(faculty);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </div>
                  <div className="hover:cursor-pointer">
                    <Button
                      onClick={() => {
                        openDeleteModal(faculty);
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
        {faculties.data?.result.length == 0 && (
          <div className="flex h-[200px] w-full flex-col items-center justify-center">
            No faculty found!
            <div>
              <Button onClick={toggleFacultyModifyModal} className="mt-2">
                <Plus />
                Add Faculty
              </Button>
            </div>
             
          </div>
        )}
        <div className="flex w-full justify-center p-2">
          {faculties.data != undefined && (
            <PaginationBar
              totalPageCount={faculties.data?.totalPages}
              currentPage={faculties.data?.page}
              onClick={(page) => {
                setCurrentPage(page);
              }}
            />
          )}
        </div>
      </div>
      {/* This dialog used for adding a faculty */}
      <Modal
        open={isFacultyCreateModalOpen}
        onClickBackdrop={toggleFacultyModifyModal}
        className="w-[400px]"
      >
        <Button
          size="sm"
          shape="circle"
          className="absolute right-2 top-2"
          onClick={toggleFacultyModifyModal}
        >
          ✕
        </Button>
        <Modal.Header className="font-bold">
          {isFacultyEditing != undefined ? "Edit" : "Add"} Faculty
        </Modal.Header>

        <Modal.Body>
          <form
            onSubmit={facultyForm.handleSubmit(onFacultyModifySubmit)}
            className="flex flex-col"
          >
            <div>
              <div className="flex w-full space-x-2">
                <div className="w-1/2">
                  <p>Suffix</p>
                  <Input
                    type="text"
                    className="mt-2 w-full"
                    placeholder="Suffix"
                    {...facultyForm.register("suffix")}
                  />
                  <ErrorMessage
                    errors={facultyForm.formState.errors}
                    name="suffix"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                </div>
                <div className="w-1/2">
                  <p>First Name</p>
                  <Input
                    type="text"
                    className="mt-2 w-full"
                    placeholder="First Name"
                    {...facultyForm.register("first_name")}
                  />
                  <ErrorMessage
                    errors={facultyForm.formState.errors}
                    name="first_name"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                </div>
                <div className="w-1/2">
                  <p>Last Name</p>
                  <Input
                    type="text"
                    className="mt-2 w-full"
                    placeholder="Last Name"
                    {...facultyForm.register("last_name")}
                  />
                  <ErrorMessage
                    errors={facultyForm.formState.errors}
                    name="last_name"
                    render={({ message }) => (
                      <p className="font-semibold text-red-600">{message}</p>
                    )}
                  />
                </div>
              </div>
              <p className="mt-2">Email</p>
              <Input
                type="email"
                className="mt-2 w-full"
                placeholder="Email"
                {...facultyForm.register("email")}
              />
              <ErrorMessage
                errors={facultyForm.formState.errors}
                name="email"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />

              <p className="mt-2">Is Adjunct?</p>
              <Checkbox
                color="primary"
                className="mt-2"
                {...facultyForm.register("is_adjunct")}
              />

              <ErrorMessage
                errors={facultyForm.formState.errors}
                name="is_adjunct"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button color="success" type="submit" className="mt-2">
                {isFacultyEditing != undefined ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/* This dialog for deleting a faculty */}
      <ConfirmDeleteModal
        open={isFacultyDeleteModalOpen}
        title="Delete Faculty?"
        message={
          facultyDeleteValue
            ? `Are you sure you want delete '${facultyDeleteValue?.first_name} ${facultyDeleteValue?.last_name}'?`
            : "Error"
        }
        onClose={() => {
          openFacultyDeleteModal(false);
        }}
        onConfirm={deleteFaculty}
      />
    </>
  );
};

export default Faculty;