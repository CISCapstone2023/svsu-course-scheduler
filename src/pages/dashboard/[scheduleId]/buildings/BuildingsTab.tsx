import { useCallback, useEffect, useState } from "react";
import { Button, Input, Modal, Select, Table } from "react-daisyui";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { Pencil, Plus, Trash } from "tabler-icons-react";
import { debounce } from "lodash";

import { api } from "src/utils/api";

import {
  createCampusSchema as createBuildingSchema,
  ICreateBuilding,
  ICreateCampus,
} from "src/validation/buildings";

import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";
import { GuidelineCampus as GuidelineBuilding } from "@prisma/client";
import { toast } from "react-toastify";

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
  const buildings = api.buildings.getAllBuildings.useQuery({
    search: searchValue,
  });

  const campuses = api.buildings.getAllCampus.useQuery({
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
  const [buildingCreateModal, setBuildingCreateModal] =
    useState<boolean>(false);

  //DELETE MODAL
  const [buildingDeleteModal, setBuildingDeleteModal] =
    useState<boolean>(false);
  const [buildingDeleteValue, setBuildingDeleteValue] =
    useState<GuidelineBuilding>();

  /**
   * openDeleteModal -
   * Open Modal for the current campus (which is a GuidelineCampus)
   * @param building
   */
  const openDeleteModal = (building: GuidelineBuilding) => {
    setBuildingDeleteValue(building);
    setBuildingDeleteModal(true);
  };
  /**
   * useForm -
   * This creates a new form using the react-form-hooks.
   */
  const { reset, ...buildingForm } = useForm<ICreateBuilding>({
    mode: "onBlur",
    resolver: zodResolver(createBuildingSchema),
  });

  const toggleBuildingModifyModal = () => {
    //Reset the form so we can add (or edit a new user)
    reset({});
    setBuildingEditing(undefined);
    setBuildingCreateModal(!buildingCreateModal);
  };

  //Grab the mutations from the backend for adding, updating, and deleting
  const buildingAddMutation = api.buildings.addBuilding.useMutation();
  const buildingUpdateMutation = api.buildings.updateBuilding.useMutation();
  const buildingDeleteMutation = api.buildings.deleteBuilding.useMutation();

  /**
   * onCampusModifySubmit
   * A useCallback which will only update on change of the mutation.
   * Parameters are passed through the reference
   */
  const onBuildingModifySubmit = async (data: ICreateBuilding) => {
    //Do we have to update campus
    console.log(buildingEditing);

    if (buildingEditing) {
      const result = await buildingUpdateMutation.mutateAsync({
        tuid: buildingEditing?.tuid,
        ...data,
      });

      if (result) {
        toast.info(`Updated '${data.name}'`);
      } else {
        toast.error(`Failed to add building '${data.name}'`);
      }

      //Update the list
      buildings.refetch();
    } else {
      const result = await buildingAddMutation.mutateAsync(data);
      if (result) {
        toast.success(`Added new building '${data.name}'`);
      } else {
        toast.error(`Failed to add building '${data.name}'`);
      }
    }

    buildings.refetch();
    //Toggle the modal
    setBuildingCreateModal(false);
  };

  /**
   * deleteCampus -
   * Delete a campus based on tuid that is in the campusDeleteValue
   */
  const deleteBuilding = async () => {
    //Make sure the value of the campus we want to delete is not undefined
    if (buildingDeleteValue != undefined) {
      //Now send the mutation to the server. The server will return
      //A boolean value that either it deleted or it failed to delete
      const response = await buildingDeleteMutation.mutateAsync({
        tuid: buildingDeleteValue?.tuid,
      });

      //If its true, that's a good!
      if (response) {
        toast.success(`Succesfully deleted '${buildingDeleteValue?.name}'`, {
          position: toast.POSITION.TOP_RIGHT,
        });
        //Else its an error
      } else {
        toast.error(`Failed to deleted '${buildingDeleteValue?.name}'`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }
    //Now we just need to reftech the campuses
    buildings.refetch();
    //And close the modal
    setBuildingDeleteModal(false);
  };

  const [buildingEditing, setBuildingEditing] = useState<GuidelineBuilding>();

  return (
    <>
      <div className="m-2 flex justify-between ">
        <div>
          <Input onChange={onSearch} placeholder="Search" />
        </div>
        <div>
          <Button
            onClick={() => {
              toggleBuildingModifyModal();
            }}
          >
            <Plus />
            Add Building
          </Button>
        </div>
      </div>
      <div className="h-ful m-2 overflow-x-hidden">
        <Table className="w-full shadow-lg" zebra={true}>
          <Table.Head>
            <span />
            <div className="grow">Name</div>
            <div className="grow">Prefix</div>
            <div className="grow">Classrooms</div>
            <div>Edit</div>
            <div>Delete</div>
          </Table.Head>

          <Table.Body>
            {buildings.data?.result.map((building, i) => {
              return (
                <Table.Row key={i}>
                  <span>{i + 1}</span>
                  <span>{building.name}</span>
                  <span>{building.prefix}</span>
                  <span>{building.classrooms}</span>
                  <div className="hover:cursor-pointer">
                    <Button
                      color="warning"
                      onClick={() => {
                        toggleBuildingModifyModal();
                        setBuildingEditing(building);
                        reset(building);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </div>
                  <div className="hover:cursor-pointer">
                    <Button
                      onClick={() => {
                        openDeleteModal(building);
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
        {buildings.data?.result.length == 0 && (
          <div className="flex h-[200px] w-full flex-col items-center justify-center">
            No campuses found!
            <div>
              <Button onClick={toggleBuildingModifyModal} className="mt-2">
                <Plus />
                Add Campus
              </Button>
            </div>
             
          </div>
        )}
        <div></div>
      </div>
      {/* This dialog used for adding a building */}
      <Modal
        open={buildingCreateModal}
        onClickBackdrop={toggleBuildingModifyModal}
        className="w-[300px]"
      >
        <Button
          size="sm"
          shape="circle"
          className="absolute right-2 top-2"
          onClick={toggleBuildingModifyModal}
        >
          ✕
        </Button>
        <Modal.Header className="font-bold">
          {buildingEditing != undefined ? "Edit" : "Add"} Building
        </Modal.Header>

        <Modal.Body>
          <form
            onSubmit={buildingForm.handleSubmit(onBuildingModifySubmit)}
            className="flex flex-col"
          >
            <div>
              <p>Name</p>
              <Input
                type="text"
                className="mt-2"
                placeholder="Building Name"
                {...buildingForm.register("name")}
              />
              <ErrorMessage
                errors={buildingForm.formState.errors}
                name="name"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
              <p>Prefix</p>
              <Input
                type="text"
                className="mt-2"
                placeholder="Prefix"
                {...buildingForm.register("prefix")}
              />
              <ErrorMessage
                errors={buildingForm.formState.errors}
                name="prefix"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
              <p>Classrooms</p>
              <Input
                type="text"
                className="mt-2"
                placeholder="Classrooms"
                {...buildingForm.register("classrooms")}
              />
              <ErrorMessage
                errors={buildingForm.formState.errors}
                name="classrooms"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />

              <p>Campus</p>
              <Select
                className="mt-2"
                placeholder="Campus Name"
                {...buildingForm.register("classrooms")}
              >
                <Select.Option value="SVSU">SVSU</Select.Option>
              </Select>

              <ErrorMessage
                errors={buildingForm.formState.errors}
                name="classrooms"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button color="success" type="submit" className="mt-2">
                {buildingEditing != undefined ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/* This dialog for deleting a campus */}
      <ConfirmDeleteModal
        open={buildingDeleteModal}
        title="Delete Building?"
        message={
          buildingDeleteValue
            ? `Are you sure you want delete '${buildingDeleteValue?.name}'?`
            : "Error"
        }
        onClose={() => {
          setBuildingDeleteModal(false);
        }}
        onConfirm={deleteBuilding}
      />
    </>
  );
};

export default CampusTab;
