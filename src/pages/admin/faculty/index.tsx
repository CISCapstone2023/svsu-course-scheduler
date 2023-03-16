import type { NextPage } from "next";
import { routeNeedsAuthSession } from "src/server/auth";

import DashboardContent from "src/components/dashboard/DashboardContent";
import DashboardContentHeader from "src/components/dashboard/DashboardContentHeader";
import DashboardLayout from "src/components/dashboard/DashboardLayout";
import Faculty from "./Faculty";
import AdminDashboardSidebar from "src/components/dashboard/AdminDashboardSidebar";

const Buildings: NextPage = () => {
  /**
   * JSX
   *
   * In the UI layout we are wrapping our dashboard with the
   * sidebar and contnent to display this faculty page as its
   * a child of the content. We also have a header (which is technically optional)
   */
  return (
    <DashboardLayout>
      <AdminDashboardSidebar />
      <DashboardContent>
        <DashboardContentHeader title="Faculty" />
        <div className="container mx-auto px-4">
          <Faculty />
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
};

export default Buildings;

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
