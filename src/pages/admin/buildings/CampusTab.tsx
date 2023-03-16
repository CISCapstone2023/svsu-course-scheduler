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
import { GuidelineCampus } from "@prisma/client";
import { toast } from "react-toastify";
import PaginationBar from "src/components/Pagination";
import AnimatedSpinner from "src/components/AnimatedSpinner";

const NOTIFICATION_POSITION = toast.POSITION.BOTTOM_LEFT;

const CampusTab = () => {
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
  const [campusPage, setCampusPage] = useState(1);

  //Query all of the data based on the search value
  const campuses = api.buildings.getAllCampus.useQuery({
    search: searchValue,
    page: campusPage,
  });

  /**
   * Page Checking Issues
   */
  useEffect(() => {
    //Check if we have any building data
    if (campuses.data) {
      //Check if we are past the current total pages and we are not fetching
      if (campusPage > campuses.data!.totalPages && !campuses.isFetching) {
        const page =
          campuses.data!.totalPages > 0 ? campuses.data!.totalPages : 1;
        setCampusPage(page); //Go to the max page
      }
    }
  }, [campuses.data]);

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
      setCampusPage(1);
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
  const [campusCreateModal, setCampusCreateModal] = useState<boolean>(false);

  //DELETE MODAL
  const [campusDeleteModal, setCampusDeleteModal] = useState<boolean>(false);
  const [campusDeleteValue, setCampusDeleteValue] = useState<GuidelineCampus>();

  /**
   * openDeleteModal -
   * Open Modal for the current campus (which is a GuidelineCampus)
   * @param campus
   */
  const openDeleteModal = (campus: GuidelineCampus) => {
    setCampusDeleteValue(campus);
    setCampusDeleteModal(true);
  };
  /**
   * useForm -
   * This creates a new form using the react-form-hooks.
   */
  const { reset, ...campusForm } = useForm<ICreateCampus>({
    mode: "onBlur",
    resolver: zodResolver(createCampusSchema),
  });

  const toggleCampusModifyModal = () => {
    //Reset the form so we can add (or edit a new user)
    reset({ name: "" });
    setCampusEditing(undefined);
    setCampusCreateModal(!campusCreateModal);
  };

  //Grab the mutations from the backend for adding, updating, and deleting
  const campusAddMutation = api.buildings.addCampus.useMutation();
  const campusUpdateMutation = api.buildings.updateCampus.useMutation();
  const campusDeleteMutation = api.buildings.deleteCampus.useMutation();

  /**
   * onCampusModifySubmit
   * A useCallback which will only update on change of the mutation.
   * Parameters are passed through the reference
   */
  const onCampusModifySubmit = async (data: ICreateCampus) => {
    //Do we have to update campus
    console.log(campusEditing);

    if (campusEditing) {
      const result = await campusUpdateMutation.mutateAsync({
        tuid: campusEditing?.tuid,
        ...data,
      });

      if (result) {
        toast.info(`Updated '${data.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      } else {
        toast.error(`Failed to add campus '${data.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      }

      //Update the list
      campuses.refetch();
    } else {
      const result = await campusAddMutation.mutateAsync(data);
      if (result) {
        toast.success(`Added new campus '${data.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      } else {
        toast.error(`Failed to add campus '${data.name}'`),
          {
            position: NOTIFICATION_POSITION,
          };
      }
    }

    campuses.refetch();
    //Toggle the modal
    setCampusCreateModal(false);
  };

  /**
   * deleteCampus -
   * Delete a campus based on tuid that is in the campusDeleteValue
   */
  const deleteCampus = async () => {
    //Make sure the value of the campus we want to delete is not undefined
    if (campusDeleteValue != undefined) {
      //Now send the mutation to the server. The server will return
      //A boolean value that either it deleted or it failed to delete
      const response = await campusDeleteMutation.mutateAsync({
        tuid: campusDeleteValue?.tuid,
      });

      //If its true, that's a good!
      if (response) {
        toast.success(`Succesfully deleted '${campusDeleteValue?.name}'`, {
          position: NOTIFICATION_POSITION,
        });
        //Else its an error
      } else {
        toast.error(`Failed to deleted '${campusDeleteValue?.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      }
    }
    //Now we just need to reftech the campuses
    campuses.refetch();
    //And close the modal
    setCampusDeleteModal(false);
  };

  const [campusEditing, setCampusEditing] = useState<GuidelineCampus>();

  return (
    <>
      <div className="m-2 flex justify-between ">
        <div>
          <Input onChange={onSearch} placeholder="Search" />
        </div>
        <div>
          <Button
            onClick={() => {
              toggleCampusModifyModal();
            }}
          >
            <Plus />
            Add Campus
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
            {campuses.data?.result.map((campus, i) => {
              return (
                <Table.Row key={i}>
                  <span>{i + 1}</span>
                  <span>{campus.name}</span>
                  <div className="hover:cursor-pointer">
                    <Button
                      color="warning"
                      onClick={() => {
                        toggleCampusModifyModal();
                        setCampusEditing(campus);
                        reset(campus);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </div>
                  <div className="hover:cursor-pointer">
                    <Button
                      onClick={() => {
                        openDeleteModal(campus);
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
        {campuses.data?.result.length == 0 && (
          <div className="flex h-[200px] w-full flex-col items-center justify-center">
            No campuses found!
            <div>
              <Button onClick={toggleCampusModifyModal} className="mt-2">
                <Plus />
                Add Campus
              </Button>
            </div>
          </div>
        )}
        {campuses.isFetching && (
          <div className="flex h-[200px] w-full flex-col items-center justify-center">
            <AnimatedSpinner />
          </div>
        )}
      </div>
      <div className="flex w-full justify-center p-2">
        {campuses.data != undefined && (
          <PaginationBar
            totalPageCount={campuses.data?.totalPages}
            currentPage={campuses.data?.page}
            onClick={(page) => {
              setCampusPage(page);
            }}
          />
        )}
      </div>
      {/* This dialog used for adding a user */}
      <Modal
        open={campusCreateModal}
        onClickBackdrop={toggleCampusModifyModal}
        className="w-[300px]"
      >
        <Button
          size="sm"
          shape="circle"
          className="absolute right-2 top-2"
          onClick={toggleCampusModifyModal}
        >
          ✕
        </Button>
        <Modal.Header className="font-bold">
          {campusEditing != undefined ? "Edit" : "Add"} Campus
        </Modal.Header>

        <Modal.Body>
          <form
            onSubmit={campusForm.handleSubmit(onCampusModifySubmit)}
            className="flex flex-col"
          >
            <div>
              <p>Campus</p>
              <Input
                type="text"
                className="mt-2"
                placeholder="Campus Name "
                {...campusForm.register("name")}
              />
              <ErrorMessage
                errors={campusForm.formState.errors}
                name="name"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button color="success" type="submit" className="mt-2">
                {campusEditing != undefined ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/* This dialog for deleting a campus */}
      <ConfirmDeleteModal
        open={campusDeleteModal}
        title="Delete Campus?"
        message={
          campusDeleteValue
            ? `Are you sure you want delete '${campusDeleteValue?.name}'?`
            : "Error"
        }
        onClose={() => {
          setCampusDeleteModal(false);
        }}
        onConfirm={deleteCampus}
      />
    </>
  );
};

export default CampusTab;
