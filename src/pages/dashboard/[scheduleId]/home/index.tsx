import type { NextPage } from "next";
import { useSession } from "next-auth/react";

import { prisma } from "src/server/db";

import DashboardLayout from "src/components/dashboard/DashboardLayout";
import DashboardSidebar, {
  DashboardPages,
} from "src/components/dashboard/DashboardSidebar";
import DashboardContent from "src/components/dashboard/DashboardContent";
import DashboardContentHeader from "src/components/dashboard/DashboardContentHeader";
import DashboardHomeTabs from "src/components/dashboard/home/DashboardHomeTabs";

import { routeNeedsAuthSession } from "src/server/auth";
import Head from "next/head";
import { useState } from "react";
import useSidebar from "src/hooks/useSidebar";

interface HomeProps {
  scheduleId: string;
  name: string;
}

const Dashboard: NextPage<HomeProps> = ({ scheduleId, name }) => {
  //Make a state to toggle the sidebar

  const [showSidebar, toggleSidebar] = useSidebar();

  return (
    <DashboardLayout>
      <Head>
        <title>{name.substring(0, 30)} | SVSU Course Scheduler | Home</title>
      </Head>
      {showSidebar && <DashboardSidebar page={DashboardPages.HOME} />}
      <DashboardContent>
        <DashboardContentHeader
          onMenuClick={toggleSidebar}
          title={`Home | ${name}`}
        ></DashboardContentHeader>
        <DashboardHomeTabs tuid={scheduleId} />
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

export const getServerSideProps = routeNeedsAuthSession(
  async ({ query }, session) => {
    //Grab schedule id from query parameter
    const scheduleId = query.scheduleId || "";

    //Check to make sure its a string
    if (typeof scheduleId === "string") {
      //Make sure we have owenrship of said revision
      const hasRevision =
        (await prisma.scheduleRevision.count({
          where: {
            tuid: query.scheduleId as string,
            creator_tuid: session?.user?.id,
          },
        })) == 1;

      //And if we DO NOT, redirect them back to the main page
      if (!hasRevision) {
        return {
          redirect: {
            destination: "/projects", //Path to the Login Screen
            permanent: false,
          },
        };
      }
    }

    //Now get the revision and get the name so we can use it in the title
    const revision = await prisma.scheduleRevision.findFirst({
      where: {
        tuid: query.scheduleId as string,
        creator_tuid: session?.user?.id,
      },
      select: {
        name: true,
      },
    });

    return {
      props: {
        scheduleId,
        name: revision!.name,
      },
    };
  }
);
