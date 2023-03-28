import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { Tabs } from "react-daisyui";
import { routeNeedsAuthSession } from "src/server/auth";
import { useState } from "react";

import DepartmentTab from "./DepartmentsTab";

import DashboardContent from "src/components/dashboard/DashboardContent";
import DashboardContentHeader from "src/components/dashboard/DashboardContentHeader";
import DashboardLayout from "src/components/dashboard/DashboardLayout";
import DashboardSidebar from "src/components/dashboard/DashboardSidebar";

import AdminDashboardSidebar from "src/components/dashboard/AdminDashboardSidebar";
import SubjectTab from "./SubjectTab";
import Head from "next/head";

const Departments: NextPage = () => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */

  const { data } = useSession();

  /**
   * Tabs
   * Keep the state of the current tab
   */
  const [tabValue, setTabValue] = useState(0);

  return (
    <DashboardLayout>
      <Head>
        <title>SVSU Course Scheduler | Departments & Subjects</title>
      </Head>
      <AdminDashboardSidebar />
      <DashboardContent>
        <DashboardContentHeader title="Department/Subjects" />
        <Tabs
          variant="lifted"
          value={tabValue}
          onChange={setTabValue}
          className="mt-2"
        >
          <Tabs.Tab value={0}>Departments</Tabs.Tab>
          <Tabs.Tab value={1}>Subjects</Tabs.Tab>
        </Tabs>
        {/* Load the <BuildingTab /> Component */}
        {tabValue == 0 && <DepartmentTab />}
        {/*Load the <CampusTab /> Component */}
        {tabValue == 1 && <SubjectTab />}
        {/* This is the dialog for creating a campus */}
      </DashboardContent>
    </DashboardLayout>
  );
};

export default Departments;

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
