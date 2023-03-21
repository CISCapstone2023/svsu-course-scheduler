import { useCallback, useEffect, useState } from "react";
import { Button, Input, Modal, Table } from "react-daisyui";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { Loader, Pencil, Plus, Trash } from "tabler-icons-react";
import { debounce } from "lodash";

import { api } from "src/utils/api";

import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";
import { type Department } from "@prisma/client";
import { toast } from "react-toastify";
import PaginationBar from "src/components/Pagination";
import AnimatedSpinner from "src/components/AnimatedSpinner";
import {
  createDepartmentsSchema,
  ICreateDepartments,
} from "src/validation/departments";

const NOTIFICATION_POSITION = toast.POSITION.BOTTOM_LEFT;

const DepartmentTab = () => {
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
   * Department Page for pagination
   *
   * Set the current page for the pagination with a default page
   * of 1. This is consumed by the pagination component and then updated.
   */
  const [DepartmentPage, setDepartmentPage] = useState(1);

  //Query all of the data based on the search value
  const departments = api.department.getAllDepartments.useQuery({
    search: searchValue,
    page: DepartmentPage,
  });

  /**
   * Page Checking Issues
   */
  useEffect(() => {
    //Check if we have any building data
    if (departments.data) {
      //Check if we are past the current total pages and we are not fetching
      if (
        DepartmentPage > departments.data!.totalPages &&
        !departments.isFetching
      ) {
        const page =
          departments.data!.totalPages > 0 ? departments.data!.totalPages : 1;
        setDepartmentPage(page); //Go to the max page
      }
    }
  }, [departments.data]);

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
      setDepartmentPage(1);
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
  const [departmentCreateModal, setDepartmentCreateModal] =
    useState<boolean>(false);

  //DELETE MODAL
  const [departmentDeleteModal, setDepartmentDeleteModal] =
    useState<boolean>(false);
  const [departmentDeleteValue, setDepartmentDeleteValue] =
    useState<Department>();

  /**
   * openDeleteModal -
   * Open Modal for the current department (which is a GuidelineDepartment)
   * @param department
   */
  const openDeleteModal = (department: Department) => {
    setDepartmentDeleteValue(department);
    setDepartmentDeleteModal(true);
  };
  /**
   * useForm -
   * This creates a new form using the react-form-hooks.
   */
  const { reset, ...departmentForm } = useForm<ICreateDepartments>({
    mode: "onBlur",
    resolver: zodResolver(createDepartmentsSchema),
  });

  const toggleDepartmentModifyModal = () => {
    //Reset the form so we can add (or edit a new user)
    reset({ name: "" });
    setDepartmentEditing(undefined);
    setDepartmentCreateModal(!departmentCreateModal);
  };

  //Grab the mutations from the backend for adding, updating, and deleting
  const departmentAddMutation = api.department.addDepartment.useMutation();
  const departmentUpdateMutation =
    api.department.updateDepartment.useMutation();
  const departmentDeleteMutation =
    api.department.deleteDepartment.useMutation();

  /**
   * onDepartmentModifySubmit
   * A useCallback which will only update on change of the mutation.
   * Parameters are passed through the reference
   */
  const onDepartmentModifySubmit = async (data: ICreateDepartments) => {
    //Do we have to update department
    console.log(departmentEditing);

    if (departmentEditing) {
      const result = await departmentUpdateMutation.mutateAsync({
        tuid: departmentEditing?.tuid,
        ...data,
      });

      if (result) {
        toast.info(`Updated '${data.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      } else {
        toast.error(`Failed to add department '${data.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      }

      //Update the list
      departments.refetch();
    } else {
      const result = await departmentAddMutation.mutateAsync(data);
      if (result) {
        toast.success(`Added new department '${data.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      } else {
        toast.error(`Failed to add department '${data.name}'`),
          {
            position: NOTIFICATION_POSITION,
          };
      }
    }

    departments.refetch();
    //Toggle the modal
    setDepartmentCreateModal(false);
  };

  /**
   * deleteDepartment -
   * Delete a department based on tuid that is in the departmentDeleteValue
   */
  const deleteDepartment = async () => {
    //Make sure the value of the department we want to delete is not undefined
    if (departmentDeleteValue != undefined) {
      //Now send the mutation to the server. The server will return
      //A boolean value that either it deleted or it failed to delete
      const response = await departmentDeleteMutation.mutateAsync({
        tuid: departmentDeleteValue?.tuid,
      });

      //If its true, that's a good!
      if (response) {
        toast.success(`Succesfully deleted '${departmentDeleteValue?.name}'`, {
          position: NOTIFICATION_POSITION,
        });
        //Else its an error
      } else {
        toast.error(`Failed to deleted '${departmentDeleteValue?.name}'`, {
          position: NOTIFICATION_POSITION,
        });
      }
    }
    //Now we just need to reftech the departments
    departments.refetch();
    //And close the modal
    setDepartmentDeleteModal(false);
  };

  const [departmentEditing, setDepartmentEditing] = useState<Department>();

  return (
    <>
      <div className="m-2 flex justify-between ">
        <div>
          <Input onChange={onSearch} placeholder="Search" />
        </div>
        <div>
          <Button
            onClick={() => {
              toggleDepartmentModifyModal();
            }}
          >
            <Plus />
            Add Department
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
            {departments.data?.result.map((department, i) => {
              return (
                <Table.Row key={i}>
                  <span>{i + 1}</span>
                  <span>{department.name}</span>
                  <div className="hover:cursor-pointer">
                    <Button
                      color="warning"
                      onClick={() => {
                        toggleDepartmentModifyModal();
                        setDepartmentEditing(department);
                        reset(department);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </div>
                  <div className="hover:cursor-pointer">
                    <Button
                      onClick={() => {
                        openDeleteModal(department);
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
        {departments.data?.result.length == 0 && (
          <div className="flex h-[200px] w-full flex-col items-center justify-center">
            No department found!
            <div>
              <Button onClick={toggleDepartmentModifyModal} className="mt-2">
                <Plus />
                Add Department
              </Button>
            </div>
          </div>
        )}
        {departments.isFetching && (
          <div className="flex h-[200px] w-full flex-col items-center justify-center">
            <AnimatedSpinner />
          </div>
        )}
      </div>
      <div className="flex w-full justify-center p-2">
        {departments.data != undefined && (
          <PaginationBar
            totalPageCount={departments.data?.totalPages}
            currentPage={departments.data?.page}
            onClick={(page) => {
              setDepartmentPage(page);
            }}
          />
        )}
      </div>
      {/* This dialog used for adding a user */}
      <Modal
        open={departmentCreateModal}
        onClickBackdrop={toggleDepartmentModifyModal}
        className="w-[300px]"
      >
        <Button
          size="sm"
          shape="circle"
          className="absolute right-2 top-2"
          onClick={toggleDepartmentModifyModal}
        >
          ✕
        </Button>
        <Modal.Header className="font-bold">
          {departmentEditing != undefined ? "Edit" : "Add"} Department
        </Modal.Header>

        <Modal.Body>
          <form
            onSubmit={departmentForm.handleSubmit(onDepartmentModifySubmit)}
            className="flex flex-col"
          >
            <div>
              <p>Department</p>
              <Input
                type="text"
                className="mt-2"
                placeholder="Department Name "
                {...departmentForm.register("name")}
              />
              <ErrorMessage
                errors={departmentForm.formState.errors}
                name="name"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button color="success" type="submit" className="mt-2">
                {departmentEditing != undefined ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/* This dialog for deleting a department */}
      <ConfirmDeleteModal
        open={departmentDeleteModal}
        title="Delete Department?"
        message={
          departmentDeleteValue
            ? `Are you sure you want delete '${departmentDeleteValue?.name}'?`
            : "Error"
        }
        onClose={() => {
          setDepartmentDeleteModal(false);
        }}
        onConfirm={deleteDepartment}
      />
    </>
  );
};

export default DepartmentTab;
