import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import DashboardLayout from "src/components/dashboard/DashboardLayout";
import ProjectItem from "src/components/projects/ProjectsItem";
import ProjectRevisionItem from "src/components/projects/ProjectsRevisionItem";
import ProjectsLayout from "src/components/projects/ProjectsLayout";
import { routeNeedsAuthSession } from "src/server/auth";
import { Logout } from "tabler-icons-react";

const Projects: NextPage = () => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */
  const { data } = useSession();

  return (
    <DashboardLayout>
      <div className="w-full flex-col p-5">
        <div className="flex w-full justify-between pb-12">
          <p className="justify-start text-lg">
            Welcome {data?.user?.id == null ? "User" : data?.user?.id},
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
