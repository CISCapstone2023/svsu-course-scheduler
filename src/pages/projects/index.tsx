//Next and NextAuth
import type { NextPage } from "next";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Select from "react-select";

//React Component Libraries and Icons
import { FilePlus, Logout, QuestionMark } from "tabler-icons-react";
import { Button, Input, Modal, Steps, Tooltip } from "react-daisyui";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type typeToFlattenedError } from "zod";

//TRPC
import { routeNeedsAuthSession } from "src/server/auth";
import { api } from "src/utils/api";

//Local file imports
import ProjectItem from "src/components/projects/ProjectsItem";
import ProjectRevisionItem from "src/components/projects/ProjectsRevisionItem";
import ProjectsLayout from "src/components/projects/ProjectsLayout";
import PaginationBar from "src/components/Pagination";
import DashboardLayout from "src/components/dashboard/DashboardLayout";
import ProjectsUpload from "src/components/projects/projectUploading/ProjectsUpload";
import ProjectDataTableEdit, {
  columnLookupTable,
} from "src/components/projects/projectUploading/ProjectDataTableEdit";
import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";

//Images
import cardinalLogo from "src/pages/projects/cardinalLogo.png";

//Validations
import {
  finalizeProjectOnBoarding,
  type IProjectFinalizeOnboarding,
  type IProjectOrganizedColumnRowNumerical,
} from "src/validation/projects";
import { IRevisionSelect } from "src/server/api/routers/calendar";

//THE DEFAULT SCHEMA FOR THE ORGANIZED COLUMNS
const DEFAULT_ORGANIZED_COLUMNS = {
  noteWhatHasChanged: -1,
  section_id: -1,
  term: -1,
  div: -1,
  department: -1,
  subject: -1,
  course_number: -1,
  section: -1,
  title: -1,
  instruction_method: -1,
  faculty: -1,
  campus: -1,
  credits: -1,
  capacity: -1,
  start_date: -1,
  end_date: -1,
  building: -1,
  room: -1,
  start_time: -1,
  end_time: -1,
  days: -1,
  noteAcademicAffairs: -1,
  notePrintedComments: -1,
};

/**
 * Projects
 * The project page shows a list of projects based on a SCHEDULE or a REVISION
 * In reality a project and a schedule mean the same thing but they just have many revisions.
 *
 * This page allows us to select a scheudle/project and also upload new files to mange other projects if needed.
 *
 * @returns nothing
 */
const Projects: NextPage = () => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */
  const { data } = useSession();
  const router = useRouter();

  //Onboarding data, which is a multidimensional array of strings
  interface IOnboarding {
    tuid: string;
    table: Array<Array<string>>;
  }

  //The data being uploaded
  const [uploadedData, setData] = useState<IOnboarding>();

  //ConfirmationCancel Modal State
  const [confirmationCancel, setComfirmation] = useState<boolean>(false);

  //Visibility of the modal
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  //The current page for the pagination
  const [currentPage, setCurrentPage] = useState(1);

  //The reset flag for the onboarding
  const [setReset, setResetFlag] = useState(false);

  //The current stage for the onboarding
  const [stage, setStage] = useState<number>(1);

  //The current list of errors from zod
  const [error, setError] = useState<
    //TODO: Can this type be improved to remove anys?
    typeToFlattenedError<any, any> | never[] | undefined
  >(undefined);

  //Get the mutation
  const verifyOrganizedColumnsMutation =
    api.projects.verifyOrganizedColumns.useMutation();

  const toggleVisible = () => {
    //set visibility of the modal
    if (stage == 1) {
      setModalVisible(!modalVisible);
    } else if (modalVisible) {
      //show confirmation box if starting to close
      setComfirmation(true);
    } else {
      setModalVisible(!modalVisible);
    }
  };

  const handleStage = (s: number) => {
    setStage(s);
  };

  //if stage is not finalize yet
  const toggleStage = async () => {
    if (stage == 1.5) {
      setStage(stage + 0.5);
    } else if (stage == 2) {
      // if (uploadedData?.tuid != undefined) {
      //   const result = await verifyOrganizedColumnsMutation.mutateAsync({
      //     tuid: uploadedData.tuid,
      //     columns: { ...organizedColumns },
      //   });
      //   if (result.success == true) {
      //     toast.success("Successfully organized the columns!.", {
      //       position: toast.POSITION.BOTTOM_LEFT,
      //     });
      //     setStage(stage + 1);
      //   } else {
      //     toast.error("Internal Error had occured...", {
      //       position: toast.POSITION.BOTTOM_LEFT,
      //     });
      //     alert(JSON.stringify(result.errors));
      //   }
      // } else {
      //   toast.error("Could not organize columns. Please try again.", {
      //     position: toast.POSITION.BOTTOM_LEFT,
      //   });
      // }
    } else {
      setStage(stage + 1);
    }
  };

  const backStage = () => {
    if (stage <= 1) {
      setStage(1);
    } else if (stage == 2) {
      setComfirmation(true);
    }
  };

  const result = api.projects.getAllScheduleRevisions.useQuery({
    search: "",
    page: currentPage,
  });
  const removeRevision = api.projects.deleteScheduleRevision.useMutation();

  //The list of revisions for the selection on the bottom calendar poration
  const revisionList = api.calendar.getSemesters.useQuery();
  //The revision which is selected for the tabs at the bottom
  const [selectedRevision, setSelectRevision] = useState<IRevisionSelect>();

  //delete revision
  const deleteRevision = async (DeletedTuid: string) => {
    try {
      const response = await removeRevision.mutateAsync({
        tuid: DeletedTuid,
      });

      //If its true, that's a good!
      if (response) {
        toast.success(`Succesfully Remove Revision`, {
          position: toast.POSITION.TOP_RIGHT,
        });
        //Else its an error
      } else {
        toast.error(`Failed to Remove Revision`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      // handle error
      toast.error(`Failed to Connect Database`, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const [organizedColumns, setOrganizeColumns] =
    useState<IProjectOrganizedColumnRowNumerical>({
      // noteWhatHasChanged: 0,
      // section_id: 1,
      // term: 2,
      // div: 3,
      // department: 4,
      // subject: 5,
      // course_number: 6,
      // section: 7,
      // title: 8,
      // instruction_method: 9,
      // faculty: 10,
      // campus: 11,
      // credits: 12,
      // capacity: 13,
      // start_date: 17,
      // end_date: 18,
      // building: 20,
      // room: 21,
      // start_time: 22,
      // end_time: 23,
      // days: 24,
      // noteAcademicAffairs: 27,
      // notePrintedComments: 28,
      noteWhatHasChanged: -1,
      section_id: -1,
      term: -1,
      div: -1,
      department: -1,
      subject: -1,
      course_number: -1,
      section: -1,
      title: -1,
      instruction_method: -1,
      faculty: -1,
      campus: -1,
      credits: -1,
      capacity: -1,
      start_date: -1,
      end_date: -1,
      building: -1,
      room: -1,
      start_time: -1,
      end_time: -1,
      days: -1,
      noteAcademicAffairs: -1,
      notePrintedComments: -1,
    });

  /**
   * Add localstorage for organizing columns
   * This will occur on the mount process of the application
   */
  useEffect(() => {
    const localStorageColumns = localStorage.getItem("columns");
    console.log({ localStorageColumns });
    if (localStorageColumns != null) {
      const organizeColumnsArray = JSON.parse(localStorageColumns);
      setOrganizeColumns(organizeColumnsArray);
    }
  }, []);

  //Get the columns that have no been organized
  function getMissingColumns() {
    //The columns missing
    const missingColumns = [];
    //The temp list of columns
    const tempOrganizedColumns = organizedColumns as Record<string, number>;
    //Loop all columns
    for (const i in tempOrganizedColumns) {
      //If said column is -1 then its not organized
      if (tempOrganizedColumns[i] == -1) {
        missingColumns.push(
          columnLookupTable.find((item) => {
            return item.value == i;
          })?.label
        );
      }
    }
    //Return said columns back so they can be rendered
    return missingColumns;
  }

  /**
   * Onboaring Form
   *
   * A form which we can finalize the onboaring process. Uses a custom zod schema
   * which has a single name to onboard the current revision into the system
   */
  const { reset, ...onboardingForm } = useForm<IProjectFinalizeOnboarding>({
    mode: "onBlur",
    resolver: zodResolver(finalizeProjectOnBoarding),
  });

  //Get the mutation from the backend API so we can create said revision!!
  const createRevisionMutation =
    api.projects.createScheduleRevision.useMutation();

  /**
   * Handle Form Submit
   *
   * This will handle the form submit to create the new revision.
   * It will check to make sure a name is present before it runs said function
   * as this is taken care of by the useForm (react-hook-form) library
   *
   * @param value
   */
  const onHandleFormSubmit = async (value: IProjectFinalizeOnboarding) => {
    if (uploadedData?.tuid != undefined && organizedColumns != undefined) {
      const result = await createRevisionMutation.mutateAsync({
        columns: organizedColumns,
        tuid: uploadedData.tuid,
        name: value.name,
      });
      if (result.success) {
        //Alert the user it as created sucessfully
        toast.success("Created Sucessfully, redirecting...", {
          position: toast.POSITION.BOTTOM_LEFT,
        });
        //Then after two seconds redirect the user via the router
        setTimeout(() => {
          router.push(`/dashboard/${uploadedData.tuid}/home`);
        }, 2000);
      } else {
        //Show an notification that an error had occured the user
        toast.error("An error had occured...", {
          position: toast.POSITION.BOTTOM_LEFT,
        });
        //Add the errors to the state to be shown on screen
        setError(result.errors);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full flex-col p-5">
        <div className="flex w-full justify-between pb-12">
          <div className="flex">
            <Image
              src={cardinalLogo}
              alt="SVSU Cardinal Logo"
              width={80}
              height={80}
              priority
            />

            <div className="mt-3 ml-2 justify-start text-lg font-medium">
              Welcome to Class Scheduling Program!
              <div className="font-thin text-inherit">
                {data?.user?.email == null ? "User" : data?.user?.email}
              </div>
            </div>
          </div>

          <button
            className="justify-ends btn-active btn"
            onClick={() => {
              signOut();
            }}
          >
            <Logout size={30} />
            Log Out
          </button>
        </div>
        <Modal
          open={modalVisible}
          className=" max-h-[250rem] min-w-[90%] max-w-5xl"
        >
          <Modal.Header className="flex justify-center font-bold">
            <Steps>
              <Steps.Step
                color={stage >= 1 ? "success" : "ghost"}
                value={stage > 1 ? "✓" : "1"}
              >
                Import Excel
              </Steps.Step>
              <Steps.Step
                color={stage >= 2 ? "success" : "ghost"}
                value={stage > 2 ? "✓" : "2"}
              >
                Finalize
              </Steps.Step>
            </Steps>
            {stage === 2 ? (
              <Tooltip
                message="Pick the right column name based on the dropdown!"
                position="bottom"
                className="relative top-1"
              >
                <QuestionMark
                  size={30}
                  strokeWidth={2}
                  color={"black"}
                  className="rounded-lg border"
                />
              </Tooltip>
            ) : (
              <></>
            )}
            <Button
              size="sm"
              shape="circle"
              className="absolute right-2 top-2"
              onClick={toggleVisible}
            >
              ✕
            </Button>
          </Modal.Header>

          <Modal.Body className=" h-4/5 w-full flex-col overflow-y-auto  transition-all duration-200 ">
            <div className="flex  w-full justify-center overflow-y-auto align-middle transition-all duration-200">
              {stage <= 1.5 && (
                <ProjectsUpload
                  resetFlag={setReset}
                  resetForm={setResetFlag}
                  setStage={handleStage}
                  onFinish={(data) => {
                    if (data === undefined) {
                      setStage(1);
                    } else {
                      console.log({ data });
                      setData(data);
                      setStage(stage + 0.5);
                    }
                  }}
                />
              )}
              {stage === 2 && (
                <div className="flex h-full w-full  flex-col">
                  {/* <ProjectFinalize
                    tuid={uploadedData?.tuid}
                    columns={organizedColumns}
                  /> */}
                  <div className="flex h-full w-full">
                    {getMissingColumns().length > 0 && (
                      <div className="mr-5 max-h-96 min-w-[200px] overflow-y-auto">
                        <div className="sticky top-0 flex justify-between bg-white">
                          <strong className="">Columns</strong>
                          <Button
                            size="sm"
                            color="error"
                            onClick={() => {
                              setOrganizeColumns(DEFAULT_ORGANIZED_COLUMNS);
                            }}
                          >
                            Reset
                          </Button>
                        </div>
                        <ul>
                          {getMissingColumns().map((value, i) => {
                            return (
                              <li className="" key={i}>
                                •{value}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {error !== undefined && (
                      <div className="mr-5 max-h-96 min-w-[200px] overflow-y-auto">
                        <strong className="sticky top-0 bg-white text-red-600">
                          Errors Found!
                        </strong>
                        <ul>
                          {error &&
                            "fieldErrors" in error &&
                            error.fieldErrors &&
                            Object.entries(error.fieldErrors).map(
                              ([field, messages]) => (
                                <li key={field}>
                                  <strong>{field}: </strong> <br />
                                  {messages}
                                </li>
                              )
                            )}
                        </ul>
                      </div>
                    )}
                    <ProjectDataTableEdit
                      uploaded={uploadedData?.table}
                      columns={organizedColumns}
                      onUpdateOrganizedColumns={(value) => {
                        setOrganizeColumns(
                          value as IProjectOrganizedColumnRowNumerical
                        );
                        localStorage.setItem("columns", JSON.stringify(value));
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
          <div className=" relative mt-5 flex w-full justify-between justify-self-end align-middle">
            {" "}
            {stage > 1.5 ? (
              <form
                onSubmit={onboardingForm.handleSubmit(onHandleFormSubmit)}
                className=" flex w-full items-end space-x-2 font-sans"
              >
                <div className="form-control w-full justify-start">
                  <div className="flex w-full justify-between space-x-2">
                    <div className="w-full flex-col">
                      {" "}
                      <label className="label ">
                        <span className="label-text">Name</span>
                      </label>{" "}
                      <Input
                        type="text"
                        placeholder="eg. Fall Draft"
                        className=" w-full"
                        {...onboardingForm.register("name")}
                      />
                    </div>
                    <div className="w-full flex-col">
                      <label className="label">
                        <span className="label-text">Select Revision</span>
                      </label>
                      <Select
                        menuPlacement="top"
                        options={revisionList.data as IRevisionSelect[]}
                        defaultInputValue="N/A"
                        value={selectedRevision}
                        classNamePrefix="selection"
                        className="h-10"
                        onChange={(selectedRevision) => {
                          //Check to make sure the reivison won't be undefined
                          if (selectedRevision != undefined) {
                            setSelectRevision(selectedRevision);
                          }
                        }}
                      />
                    </div>
                    <div className="flex-col space-y-2">
                      <Button
                        color="success"
                        type="submit"
                        className="w-full"
                        disabled={getMissingColumns().length > 0}
                      >
                        Finalize
                      </Button>
                      <Button
                        color="error"
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={backStage}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <ErrorMessage
                      errors={onboardingForm.formState.errors}
                      name="name"
                      render={({ message }) => (
                        <p className="font-semibold text-red-600">{message}</p>
                      )}
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div className="grow"></div>
            )}
            {stage != 2 && (
              <Button className="" disabled={stage < 1.5} onClick={toggleStage}>
                {stage == 2 ? "Finalize" : "Next"}
              </Button>
            )}
          </div>
        </Modal>
        <ConfirmDeleteModal
          title="Cancellation Confirmation"
          message="Are you sure you want to close?"
          open={stage >= 1.5 && confirmationCancel}
          onClose={() => {
            setComfirmation(false);
          }}
          //when confirm, reset everything to the beginning
          onConfirm={() => {
            if (stage == 2) setStage(stage - 1);
            if (uploadedData?.tuid) deleteRevision(uploadedData?.tuid);
            setComfirmation(false);
            setModalVisible(false);
            setStage(1);
            setResetFlag(true);
            setError(undefined);
            setSelectRevision(undefined);
          }}
        />
        <div className="container mx-auto  flex justify-between p-4">
          <p className=" text-3xl font-bold">Recent Project: </p>

          <Button color="success" className="" onClick={toggleVisible}>
            <FilePlus size={30} /> Create New Project
          </Button>
        </div>
        <ProjectsLayout>
          {result != undefined ? (
            result.data?.result.map((data, index) => {
              function calculateTime(
                updatedAt: Date | undefined
              ): string | undefined {
                if (updatedAt === undefined) return "Error Loading Time";
                else {
                  const current = new Date();
                  let offSetTime =
                    (current.valueOf() - updatedAt.valueOf()) / 1000;

                  if (offSetTime === 0) return "Just Now";
                  else if (offSetTime < 60)
                    return Math.trunc(offSetTime) + " seconds ago";
                  else if (offSetTime >= 60 && offSetTime < 3600) {
                    //if more than 60 seconds
                    offSetTime = offSetTime / 60;
                    return Math.trunc(offSetTime) + " minute(s) ago";
                  } else if (offSetTime >= 3600 && offSetTime < 86400) {
                    //if more than 60 minutes
                    offSetTime = offSetTime / 60 / 60;
                    return Math.trunc(offSetTime) + " hour(s) ago";
                  } else if (
                    offSetTime >= 86400 &&
                    offSetTime < 5 * 24 * 60 * 60
                  ) {
                    //if more than one day
                    offSetTime = offSetTime / 60 / 60 / 24;
                    return Math.trunc(offSetTime) + " day(s) ago";
                  } else
                    return (
                      updatedAt.getMonth() +
                      "/" +
                      updatedAt.getDate() +
                      "/" +
                      updatedAt.getFullYear()
                    );
                }
              }
              return (
                <ProjectItem
                  strTitle={data.main.name}
                  strTimesAgo={calculateTime(data.main.updatedAt)}
                  key={index}
                  hasRevision={data.revisions.length > 0}
                  id={data.main.tuid != undefined ? data.main.tuid : "#!"}
                >
                  {data.revisions.length > 0 ? (
                    data.revisions.map((rev, index) => {
                      return (
                        <ProjectRevisionItem
                          key={index}
                          title={rev.name}
                          timesAgo={calculateTime(rev.updatedAt)}
                          id={rev.tuid}
                        />
                      );
                    })
                  ) : (
                    <></>
                  )}
                </ProjectItem>
              );
            })
          ) : (
            <span> NO REVISION FOUND!</span>
          )}
        </ProjectsLayout>

        <div className="mt-3 flex w-full justify-center  p-2">
          {result.data != undefined && result.data.totalPages > 1 && (
            <>
              <PaginationBar
                totalPageCount={result.data?.totalPages}
                currentPage={currentPage}
                onClick={(page) => {
                  setCurrentPage(page);
                }}
              />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;

/**
 * Get Server Side Properties
 *
 * NextJS supports a custom callback, so before a page is returned to the client
 * you can check on the backend, this allows for us to check if the user is
 * authenticated for example.
 *
 * So with this code we wrap the "routeNeedsAuthSession" so the user needs to
 * be signed in for this page to be shown, if its not that function will redirect the
 * user back to the "/" home sign-up page.
 *
 * Also the perk of server props is that it occurs at page load time.
 * Meaning any data we pass into the "props" return object, will be provided
 * as a prop to the "NextPage" below. So for example the {} of the props could
 * contain data which could be used.
 *
 */

export const getServerSideProps = routeNeedsAuthSession(async () => {
  //NOTE: Passing the entire session to the NextPage will error,
  //which is likely due to undefined values.
  //Ideally just hook with "useSession" in the page
  return { props: {} };
});
