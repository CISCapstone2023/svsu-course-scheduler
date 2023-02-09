import { addMinutes, set } from "date-fns";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import DashboardSidebar from "src/components/dashboard/DashbaordSidebar";
import DashboardContent from "src/components/dashboard/DashboardContent";
import DashboardContentHeader from "src/components/dashboard/DashboardContentHeader";

import DashboardLayout from "src/components/dashboard/DashboardLayout";

import { routeNeedsAuthSession } from "src/server/auth";

const Dashboard: NextPage = () => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */
  const { data } = useSession();

  const times = new Array<Date>();

  const current = set(new Date(), {
    hours: 8,
    minutes: 30,
    seconds: 0,
    milliseconds: 0,
  });
  let latest = current;
  for (let i = 0; i < 29; i++) {
    times.push(latest);
    latest = addMinutes(latest, 30);
  }
  const toTime = (date: Date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes() ? date.getMinutes() : "";
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "00" + minutes : minutes;
    const strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  };
  return (
    <DashboardLayout>
      <DashboardSidebar />
      <DashboardContent>
        <DashboardContentHeader title="Home"></DashboardContentHeader>
        <div className="flex h-full w-full">
          <div className="flex grow flex-col  bg-red-400">
            {times.map((date, i) => {
              return (
                <div key={i} className="grow bg-red-400">
                  {toTime(date)}
                </div>
              );
            })}
          </div>
          <div className="h-100 w-100 grow bg-green-400">B</div>
          <div className="h-100 w-100 grow bg-blue-400">C</div>
          <div className="h-100 w-100 grow bg-red-400">D</div>
          <div className="h-100 w-100 grow bg-orange-400">E</div>
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
};

export default Dashboard;

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
