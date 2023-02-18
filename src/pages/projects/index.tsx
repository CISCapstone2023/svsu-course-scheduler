import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import ProjectItem from "src/components/projects/ProjectsItem";
import ProjectRevisionItem from "src/components/projects/ProjectsRevisionItem";
import ProjectsLayout from "src/components/projects/ProjectsLayout";
import { routeNeedsAuthSession } from "src/server/auth";
import { FilePlus, Logout, QuestionMark } from "tabler-icons-react";
import { Button, Modal, Steps, Tooltip } from "react-daisyui";
import { useState } from "react";
import { api } from "src/utils/api";
import PaginationBar from "src/components/Pagination";
import DashboardLayout from "src/components/dashboard/DashboardLayout";
import ProjectsUpload from "src/components/projects/projectUploading/ProjectsUpload";
import ProjectDataTableEdit from "src/components/projects/projectUploading/ProjectDataTableEdit";
import { useRouter } from "next/router";
import ConfirmDeleteModal from "src/components/ConfirmDeleteModal";
import ProjectFinalize from "src/components/projects/projectUploading/ProjectFinalize";

const Projects: NextPage = () => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */
  const { data } = useSession();
  const router = useRouter();

  interface IOnboarding {
    tuid: string;
    table: Array<Array<string>>;
  }
  const [uploadedData, setData] = useState<IOnboarding>();
  const [confirmationCancel, setComfirmation] = useState<boolean>(false);

  const [visible, setVisible] = useState<boolean>(false);

  const toggleVisible = () => {
    if (stage == 1) {
      setVisible(!visible);
    } else if (visible) {
      setComfirmation(true);
    } else {
      setVisible(!visible);
    }
  };
  const [stage, setStage] = useState<number>(1);

  //if stage is not finalize yet
  const toggleStage = () => {
    if (stage == 3) {
      toggleVisible();
      setStage(1);
    } else if (stage == 1.5) {
      setStage(stage + 0.5);
    } else {
      setStage(stage + 1);
    }
  };

  //
  const backStage = () => {
    if (stage <= 1) {
      setStage(1);
    } else if (stage == 2) {
      setComfirmation(true);
    } else {
      setStage(stage - 1);
    }
  };

  const result = api.projects.getAllScheduleRevisions.useQuery({
    search: "",
    page: 0,
  });

  const onCLickPage = () => {
    console.log("click Page");
  };
  const goToMain = () => {
    const urlMain: string = "/dashboard/" + uploadedData?.tuid + "/home";
    router.push(urlMain);
  };
  return (
    <DashboardLayout>
      <div className="w-full flex-col p-5">
        <div className="flex w-full justify-between pb-12">
          <p className="justify-start text-lg font-medium">
            Welcome to Class Scheduling Program!
            <br />
            <span className="font-thin text-inherit">
              {data?.user?.email == null ? "User" : data?.user?.email},
            </span>
          </p>

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

        <Modal open={visible} className="max-h-[250rem]  w-11/12 max-w-5xl ">
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
                Organize Column
              </Steps.Step>
              <Steps.Step
                color={stage >= 3 ? "success" : "ghost"}
                value={stage > 3 ? "✓" : "3"}
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

          <Modal.Body className="s h-2/3 w-full flex-col overflow-y-auto">
            <div className="flex  w-full justify-center overflow-y-auto align-middle">
              {stage <= 1.5 ? (
                <ProjectsUpload
                  onFinish={(data) => {
                    if (data !== undefined && data.tuid === undefined) {
                      console.log({ data });
                    } else {
                      console.log({ data });
                      setData(data);
                      setStage(stage + 0.5);
                    }
                  }}
                />
              ) : (
                <></>
              )}
              {stage === 2 ? (
                <ProjectDataTableEdit uploaded={uploadedData?.table} />
              ) : (
                <></>
              )}
              {stage === 3 ? <ProjectFinalize /> : <></>}
            </div>
          </Modal.Body>
          <div className=" relative mt-3 flex w-full justify-between justify-self-end align-middle">
            {" "}
            {stage > 1.5 ? (
              <Button className="" onClick={backStage}>
                Back
              </Button>
            ) : (
              <div></div>
            )}
            <Button
              className=""
              disabled={stage < 1.5}
              onClick={stage == 3 ? goToMain : toggleStage}
            >
              {stage >= 3 ? "Finalize" : "Next"}
            </Button>
          </div>
        </Modal>
        <ConfirmDeleteModal
          title="Cancellation Confirmation"
          message="Are you sure you want to close?"
          open={stage >= 2 && confirmationCancel}
          onClose={() => {
            setComfirmation(false);
          }}
          onConfirm={() => {
            if (stage == 2) setStage(stage - 1);

            setComfirmation(false);
            setVisible(false);
            setStage(1);
          }}
        />
        <div className="container mx-auto  flex justify-between p-4">
          <p className=" j text-3xl font-bold">Recent Project: </p>

          <Button color="success" className="" onClick={toggleVisible}>
            <FilePlus size={30} /> Create New Project
          </Button>
        </div>
        <ProjectsLayout>
          <ProjectItem strTitle="Fall 2023 V.3" strTimesAgo="10 times ago">
            <ProjectRevisionItem title="Fall 2023 V2" timesAgo="50 times ago" />
            <ProjectRevisionItem
              title="Fall 2023 V1"
              timesAgo="100 times ago"
            />
          </ProjectItem>
          <ProjectItem strTitle="Fall 2023 V.3" strTimesAgo="10 times ago">
            <ProjectRevisionItem title="Fall 2023 V2" timesAgo="50 times ago" />
            <ProjectRevisionItem
              title="Fall 2023 V1"
              timesAgo="100 times ago"
            />
          </ProjectItem>
          <ProjectItem strTitle="Fall 2023 V.3" strTimesAgo="10 times ago">
            <ProjectRevisionItem title="Fall 2023 V2" timesAgo="50 times ago" />
            <ProjectRevisionItem
              title="Fall 2023 V1"
              timesAgo="100 times ago"
            />
          </ProjectItem>
          <ProjectItem strTitle="Fall 2023 V.3" strTimesAgo="10 times ago">
            <ProjectRevisionItem title="Fall 2023 V2" timesAgo="50 times ago" />
            <ProjectRevisionItem
              title="Fall 2023 V1"
              timesAgo="100 times ago"
            />
          </ProjectItem>
        </ProjectsLayout>

        <div className="mt-3 flex justify-center">
          <PaginationBar
            totalPageCount={10}
            currentPage={1}
            onClick={onCLickPage}
          />
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
