import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Divider, Menu } from "react-daisyui";
import { Calendar, CaretLeft, ChartBar, Home } from "tabler-icons-react";
import DashboardSidebarItem from "./DashboardSidebarItem";
import cardinalLogo from "src/pages/projects/cardinalLogo.png";
import Image from "next/image";

/**
 * Dashboard Sidebar Properties
 *
 * Default properties for this component
 *
 * @author CIS 2023
 */
interface DashboardSidebarProps {
  children?: React.ReactNode; //Optional React Children Nodes
  page: DashboardPages; //The page type as an enum
}

/**
 * Dashboard Pages Enum
 *
 * Provides a list of enums
 *
 * @author Brendan Fuller
 */
export enum DashboardPages {
  HOME,
  SCHEDULER,
  REPORT,
}

/**
 * DashboardSidebar
 * Generates a full sidebar menu using DashboardSidebarItems
 * @Author Saturn
 * @return
 */
const DashboardSidebar = ({ page }: DashboardSidebarProps) => {
  //Use the router hook from nextjs to grab an instance of the router
  const router = useRouter();
  //Use said router query params with deconstructoring to grab the id
  const { scheduleId } = router.query;

  return (
    <div className="flex h-full min-w-[200px] flex-col bg-base-200 pt-4">
      <Menu>
        {/* Adds SVSU logo and course scheduler name to sidebar */}
        <div className="flex flex-row justify-center pl-4">
          <Image
            src={cardinalLogo}
            alt="SVSU Cardinal Logo"
            width={40}
            height={40}
            priority
            className="w-[40]"
          />
          <div className="flex pl-4">
            <p className="grow">Course Scheduler </p>
          </div>
        </div>
        <Divider />
        {/* Adds a back button to return to projects page */}
        <Link href={`/projects`}>
          <DashboardSidebarItem title="Projects">
            <CaretLeft width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        {/* Displays name of project youre on */}
        {/* <div className="flex w-full pl-4">
          <p className="font-bold">Current Project</p>
        </div>
        <Link href={`/dashboard/${scheduleId}/home`}>
          <DashboardSidebarItem
            title={name.data != undefined ? name.data.name : "Loading..."}
            bold={true}
          />
        </Link> */}

        <Divider />

        {/* Header for general section */}
        <div className="flex w-full pl-4">
          <p className="font-bold">General</p>
        </div>

        {/* Redirects to home page when clicked */}
        <Link href={`/dashboard/${scheduleId}/home`}>
          <DashboardSidebarItem
            title="Home"
            active={page == DashboardPages.HOME}
          >
            <Home width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        {/* Redirects to schedule page when clicked */}
        <Link href={`/dashboard/${scheduleId}/schedule`}>
          <DashboardSidebarItem
            title="Schedule"
            active={page == DashboardPages.SCHEDULER}
          >
            <Calendar width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        {/* Redirects to report page when clicked */}
        <Link href={`/dashboard/${scheduleId}/report`}>
          <DashboardSidebarItem
            title="Report"
            active={page == DashboardPages.REPORT}
          >
            <ChartBar width={40} height={40} />
          </DashboardSidebarItem>
        </Link>
      </Menu>
    </div>
  );
};

//Exports component with memorization
export default React.memo(DashboardSidebar);
