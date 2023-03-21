import { useCallback, useEffect, useState } from "react";
import { Button, Input, Modal, Table } from "react-daisyui";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { Loader, Pencil, Plus, Trash } from "tabler-icons-react";
import { debounce } from "lodash";

import { api } from "src/utils/api";

import { createCampusSchema, ICreateCampus } from "src/validation/buildings";

import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";
import { Subject } from "@prisma/client";
import { toast } from "react-toastify";
import PaginationBar from "src/components/Pagination";
import AnimatedSpinner from "src/components/AnimatedSpinner";
import { createSubjectsSchema, ICreateSubject } from "src/validation/subjects";

const NOTIFICATION_POSITION = toast.POSITION.BOTTOM_LEFT;

const SubjectTab = () => {
  /**
   * Router
   * Get the context of the current NextJS Router
   */
  const router = useRouter();

  /**
   * Search Value
   * The value which will be searching that is set by the debouncing below
   */
  const [searchValue, setSearchValue] = useState<string>("");

  /**
   * Data
   */

  /**
   * Campus Page for pagination
   *
   * Set the current page for the pagination with a default page
   * of 1. This is consumed by the pagination component and then updated.
   */
  const [subjectPage, setSubjectPage] = useState(1);

  //Query all of the data based on the search value
  const subjects = api.subjects.getAllSubjects.useQuery({
    search: searchValue,
    page: subjectPage,
  });

  /**
   * Page Checking Issues
   */
  useEffect(() => {
    //Check if we have any building data
    if (subjects.data) {
      //Check if we are past the current total pages and we are not fetching
      if (subjectPage > subjects.data!.totalPages && !subjects.isFetching) {
        const page =
          subjects.data!.totalPages > 0 ? subjects.data!.totalPages : 1;
        setSubjectPage(page); //Go to the max page
      }
    }
  }, [subjects.data]);

  //The function that gets called when a input event has occured.
  //It passthe the React Change Event which has a input element
  //This called the waitForSearch debounced callback that is below
  async function onSearch(e: React.ChangeEvent<HTMLInputElement>) {
    waitForSearch(e.currentTarget.value);
  }

  //Create a callbakc to hold a single instance of a debounce
  const waitForSearch = useCallback(
    //The value that is passed in the callback is directly passed into the function
    //and because debounced does the same thing it will pass the value to its parameter which
    //is an arrow function
    debounce((value: string) => {
      //Now we actually update the search so we don't keep fetching the server
      setSubjectPage(1);
      setSearchValue(value);
    }, 500), //This waits 500 ms (half a second) before the function inside (aka above) gets called
    []
  );

  /**
   * Modals
   *
   * Show and confirm users for the adding,editing,and deleting
   */

  //CREATE MODAL
  const [subjectCreateModal, setSubjectCreateModal] = useState<boolean>(false);

  //DELETE MODAL
  const [subjectDeleteModal, setSubjectDeleteModal] = useState<boolean>(false);
  const [subjectDeleteValue, setSubjectDeleteValue] = useState<Subject>();

  /**
   * openDeleteModal -
   * Open Modal for the current subject (which is a Subject)
   * @param subject
   */
  const openDeleteModal = (subject: Subject) => {
    setSubjectDeleteValue(subject);
    setSubjectDeleteModal(true);
  };
  /**
   * useForm -
   * This creates a new form using the react-form-hooks.
   */
  const { reset, ...subjectForm } = useForm<ICreateSubject>({
    mode: "onBlur",
    resolver: zodResolver(createSubjectsSchema),
  });

  const toggleSubjectModifyModal = () => {
    //Reset the form so we can add (or edit a new user)
    reset({ name: "" });
    setSubjectEditing(undefined);
    setSubjectCreateModal(!subjectCreateModal);
  };

  //Grab the mutations from the backend for adding, updating, and deleting
  const subjectAddMutation = api.subjects.addSubject.useMutation();
  const subjectUpdateMutation = api.subjects.updateSubject.useMutation();
  const subjectDeleteMutation = api.subjects.deleteSubject.useMutation();

  /**
   * onCampusModifySubmit
   * A useCallback which will only update on change of the mutation.
   * Parameters are passed through the reference
   */
  const onSubjectModifySubmit = async (data: ICreateSubject) => {
    //Do we have to update campus
    console.log(subjectEditing);

    if (subjectEditing) {
      const result = await subjectUpdateMutation.mutateAsync({
        tuid: subjectEditing?.tuid,
        ...data,
      });

      if (result) {
        toast.info(`Updated '${data.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      } else {
        toast.error(`Failed to add subject '${data.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      }

      //Update the list
      subjects.refetch();
    } else {
      console.log(data);
      const result = await subjectAddMutation.mutateAsync(data);
      if (result) {
        toast.success(`Added new subject '${data.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      } else {
        toast.error(`Failed to add subject '${data.name}'`),
          {
            position: NOTIFICATION_POSITION,
          };
      }
    }

    subjects.refetch();
    //Toggle the modal
    setSubjectCreateModal(false);
  };

  /**
   * deleteSubject -
   * Delete a subject based on tuid that is in the subjectDeleteValue
   */
  const deleteSubject = async () => {
    //Make sure the value of the campus we want to delete is not undefined
    if (subjectDeleteValue != undefined) {
      //Now send the mutation to the server. The server will return
      //A boolean value that either it deleted or it failed to delete
      const response = await subjectDeleteMutation.mutateAsync({
        tuid: subjectDeleteValue?.tuid,
      });

      //If its true, that's a good!
      if (response) {
        toast.success(`Succesfully deleted '${subjectDeleteValue?.name}'`, {
          position: NOTIFICATION_POSITION,
        });
        //Else its an error
      } else {
        toast.error(`Failed to deleted '${subjectDeleteValue?.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      }
    }
    //Now we just need to reftech the campuses
    subjects.refetch();
    //And close the modal
    setSubjectDeleteModal(false);
  };

  const [subjectEditing, setSubjectEditing] = useState<Subject>();

  return (
    <>
      <div className="m-2 flex justify-between ">
        <div>
          <Input onChange={onSearch} placeholder="Search" />
        </div>
        <div>
          <Button
            onClick={() => {
              toggleSubjectModifyModal();
            }}
          >
            <Plus />
            Add Subject
          </Button>
        </div>
      </div>
      <div className="h-ful m-2 overflow-x-hidden">
        <Table className="w-full shadow-lg" zebra={true}>
          <Table.Head>
            <span />
            <div className="grow">Name</div>
            <div>Edit</div>
            <div>Delete</div>
          </Table.Head>

          <Table.Body>
            {subjects.data?.result.map((subject, i) => {
              return (
                <Table.Row key={i}>
                  <span>{i + 1}</span>
                  <span>{subject.name}</span>
                  <div className="hover:cursor-pointer">
                    <Button
                      color="warning"
                      onClick={() => {
                        toggleSubjectModifyModal();
                        setSubjectEditing(subject);
                        reset(subject);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </div>
                  <div className="hover:cursor-pointer">
                    <Button
                      onClick={() => {
                        openDeleteModal(subject);
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
        {subjects.data?.result.length == 0 && (
          <div className="flex h-[200px] w-full flex-col items-center justify-center">
            No subjects found!
            <div>
              <Button onClick={toggleSubjectModifyModal} className="mt-2">
                <Plus />
                Add Subject
              </Button>
            </div>
          </div>
        )}
        {subjects.isFetching && (
          <div className="flex h-[200px] w-full flex-col items-center justify-center">
            <AnimatedSpinner />
          </div>
        )}
      </div>
      <div className="flex w-full justify-center p-2">
        {subjects.data != undefined && (
          <PaginationBar
            totalPageCount={subjects.data?.totalPages}
            currentPage={subjects.data?.page}
            onClick={(page) => {
              setSubjectPage(page);
            }}
          />
        )}
      </div>
      {/* This dialog used for adding a subject */}
      <Modal
        open={subjectCreateModal}
        onClickBackdrop={toggleSubjectModifyModal}
        className="w-[300px]"
      >
        <Button
          size="sm"
          shape="circle"
          className="absolute right-2 top-2"
          onClick={toggleSubjectModifyModal}
        >
          ✕
        </Button>
        <Modal.Header className="font-bold">
          {subjectEditing != undefined ? "Edit" : "Add"} Subject
        </Modal.Header>

        <Modal.Body>
          <form
            onSubmit={subjectForm.handleSubmit(onSubjectModifySubmit)}
            className="flex flex-col"
          >
            <div>
              <p>Subject</p>
              <Input
                type="text"
                className="mt-2"
                placeholder="Subject Name "
                {...subjectForm.register("name")}
              />
              <ErrorMessage
                errors={subjectForm.formState.errors}
                name="name"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button color="success" type="submit" className="mt-2">
                {subjectEditing != undefined ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/* This dialog for deleting a campus */}
      <ConfirmDeleteModal
        open={subjectDeleteModal}
        title="Delete Subject?"
        message={
          subjectDeleteValue
            ? `Are you sure you want delete '${subjectDeleteValue?.name}'?`
            : "Error"
        }
        onClose={() => {
          setSubjectDeleteModal(false);
        }}
        onConfirm={deleteSubject}
      />
    </>
  );
};

export default SubjectTab;
