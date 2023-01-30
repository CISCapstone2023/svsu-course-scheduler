import { useCallback, useEffect, useState } from "react";
import { Button, Input, Modal, Table } from "react-daisyui";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { Pencil, Plus, Trash } from "tabler-icons-react";
import { debounce } from "lodash";

import { api } from "src/utils/api";

import { createCampusSchema, ICreateCampus } from "src/validation/buildings";

import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";

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

  //Query all of the data based on the search value
  const campuses = api.buildings.getAllCampus.useQuery({
    search: searchValue,
  });

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

  const toggleVisible = () => {
    setCampusCreateModal(!campusCreateModal);
  };

  //DELETE MODAL
  const [campusDeleteModal, setCampusDeleteModal] = useState<boolean>(false);

  /**
   * Forms
   *
   * This creates a new form using the react-form-hooks
   *
   */
  const { register, handleSubmit, formState, reset } = useForm<ICreateCampus>({
    mode: "onBlur",
    resolver: zodResolver(createCampusSchema),
  });

  //Create a mutation from the backend and name it as `campusMutateAsync`
  const { mutateAsync: campusMutateAsync } =
    api.buildings.addCampus.useMutation();

  //Called on <form> onSubmit event
  const onSubmit = useCallback(
    //Return a function which will send the data
    async (data: ICreateCampus) => {
      //Result is the campus technically
      const result = await campusMutateAsync(data);
      campuses.refetch();
      //Toggle the modal
      setCampusCreateModal(false);
      reset();
    },
    [campusMutateAsync, router]
  );

  //TODO: Delete and edit user

  //const editCampus = (tuid: string) => {};

  //const deleteCampus = (tuid: string) => {};
  return (
    <>
      <div className="m-2 flex justify-between ">
        <div>
          <Input onChange={onSearch} placeholder="Search" />
        </div>
        <div>
          <Button onClick={toggleVisible}>
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
            {campuses.data?.map((campus, i) => {
              return (
                <Table.Row key={i}>
                  <span>{i + 1}</span>
                  <span>{campus.name}</span>
                  <div className="hover:cursor-pointer hover:text-yellow-400">
                    <Pencil />
                  </div>
                  <div className="hover:cursor-pointer hover:text-red-400">
                    <Trash />
                  </div>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        {campuses.data?.length == 0 && (
          <div className="flex h-full w-full flex-col items-center justify-center">
            No campuses found!
            <div>
              <Button onClick={toggleVisible} className="pt-2">
                <Plus />
                Add Campus
              </Button>
            </div>
          </div>
        )}
        <div></div>
      </div>
      {/* This dialog used for adding a user */}
      <Modal open={campusCreateModal} onClickBackdrop={toggleVisible}>
        <Button
          size="sm"
          shape="circle"
          className="absolute right-2 top-2"
          onClick={toggleVisible}
        >
          ✕
        </Button>
        <Modal.Header className="font-bold">Add/Edit Campus</Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div>
              <h3 className="card-title">Name of Campus</h3>
              <Input type="text" {...register("name")} />
              <ErrorMessage
                errors={formState.errors}
                name="name"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button color="success" type="submit" className="mt-2">
                Add Campus
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/* This dialog for deleting a campus */}
      <ConfirmDeleteModal
        open={campusDeleteModal}
        title="Delete Campus?"
        message="Are you sure you want to delete this thing?"
        onConfirmDelete={() => {
          console.log("Hello");
        }}
      />
    </>
  );
};

export default CampusTab;
