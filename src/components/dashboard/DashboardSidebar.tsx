import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Divider, Menu } from "react-daisyui";
import { api } from "src/utils/api";
import {
  Assembly,
  Calendar,
  CaretLeft,
  ChartBar,
  Home,
} from "tabler-icons-react";
import DashboardSidebarItem from "./DashboardSidebarItem";
import cardinalLogo from "src/pages/projects/cardinalLogo.png";
import Image from "next/image";

interface DashboardSidebarProps {
  children?: React.ReactNode;
}

/**
 * DashboardSidebar
 * Generates a full sidebar menu using DashboardSidebarItems
 * @Author Saturn
 * @return
 */
const DashboardSidebar = ({ children }: DashboardSidebarProps) => {
  const router = useRouter();
  const { scheduleId } = router.query;

  const name = api.dashboard.getRevisionName.useQuery({
    revision_tuid: scheduleId as string,
  });

  return (
    <div className="flex h-full w-[220px] flex-col bg-base-200 pt-4">
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
        <Divider />

        {/* Displays name of project youre on */}
        <div className="flex w-full pl-4">
          <p className="font-bold">Current Project</p>
        </div>
        <Link href={`/dashboard/${scheduleId}/home`}>
          <DashboardSidebarItem
            title={name.data != undefined ? name.data.name : "Loading..."}
            bold={true}
          />
        </Link>

        <Divider />

        {/* Header for general section */}
        <div className="flex w-full pl-4">
          <p className="font-bold">General</p>
        </div>

        {/* Redirects to home page when clicked */}
        <Link href={`/dashboard/${scheduleId}/home`}>
          <DashboardSidebarItem title="Home">
            <Home width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        {/* Redirects to schedule page when clicked */}
        <Link href={`/dashboard/${scheduleId}/schedule`}>
          <DashboardSidebarItem title="Schedule">
            <Calendar width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        {/* Redirects to report page when clicked */}
        <Link href={`/dashboard/${scheduleId}/report`}>
          <DashboardSidebarItem title="Report">
            <ChartBar width={40} height={40} />
          </DashboardSidebarItem>
        </Link>
      </Menu>
    </div>
  );
};

//Exports component with memorization
export default React.memo(DashboardSidebar);
