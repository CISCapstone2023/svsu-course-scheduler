import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { routeNeedsAuthSession } from "src/server/auth";
import { useState } from "react";

import DashboardContent from "src/components/dashboard/DashboardContent";
import DashboardContentHeader from "src/components/dashboard/DashboardContentHeader";
import DashboardLayout from "src/components/dashboard/DashboardLayout";
import DashboardSidebar from "src/components/dashboard/DashboardSidebar";
import ScheduleCalendar from "./CalendarComponent";

interface Tab {
  name: string;
  revision: string;
}

interface TabProps {
  children?: React.ReactNode;
}

const Tab = () => {
  return (
    <div className="h-50 flex grow cursor-pointer items-center justify-center border-r-2 bg-base-100 text-center hover:bg-base-200">
      <p>Winter</p>
    </div>
  );
};

const Tabs = ({}: TabProps) => {
  return (
    <div className="flex w-full border-spacing-1 border-2 border-x">
      <Tab />
      <Tab />
    </div>
  );
};

const Scheduler: NextPage = () => {
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
      <DashboardSidebar />
      <DashboardContent>
        <div className="flex h-full w-full flex-col">
          <DashboardContentHeader title="Scheduler" />
          <Tabs />
          <ScheduleCalendar semester="FA" revision="" weekends={false} />
          <Tabs />
          <ScheduleCalendar semester="SU" revision="" weekends={false} />
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
};

export default Scheduler;

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

export const getServerSideProps = routeNeedsAuthSession(async ({ query }) => {
  const scheduleId = query.scheduleId || "";

  if (typeof scheduleId === "string") {
    const hasRevision =
      (await prisma?.scheduleRevision.count({
        where: {
          tuid: query.scheduleId as string,
        },
      })) == 1;

    if (!hasRevision) {
      return {
        redirect: {
          destination: "/projects", //Path to the Login Screen
          permanent: false,
        },
      };
    }
  }

  //NOTE: Passing the entire session to the NextPage will error,
  //which is likely due to undefined values.
  //Ideally just hook with "useSession" in the page
  return { props: {} };
});
