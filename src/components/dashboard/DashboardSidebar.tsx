import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Divider, Menu } from "react-daisyui";
import {
  Assembly,
  Book,
  Building,
  Calendar,
  ChartBar,
  Home,
  User,
} from "tabler-icons-react";
import DashboardSidebarItem from "./DashboardSidebarItem";

interface DashboardSidebarProps {
  children?: React.ReactNode;
}

const DashboardSidebar = ({ children }: DashboardSidebarProps) => {
  const router = useRouter();
  const { scheduleId } = router.query;
  return (
    <div className="flex h-full w-[220px] flex-col bg-base-200 pt-4">
      <Menu>
        <Link href={`/dashboard/${scheduleId}/home`}>
          <DashboardSidebarItem title="Project" bold={true}>
            <Assembly width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        <Divider />

        <Link href={`/dashboard/${scheduleId}/home`}>
          <DashboardSidebarItem title="Home">
            <Home width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        <Link href={`/dashboard/${scheduleId}/schedule`}>
          <DashboardSidebarItem title="Schedule">
            <Calendar width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        <Link href={`/dashboard/${scheduleId}/report`}>
          <DashboardSidebarItem title="Report">
            <ChartBar width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        <Divider />

        <Link href={`/dashboard/${scheduleId}/courses`}>
          <DashboardSidebarItem title="Courses">
            <Book width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        <Link href={`/dashboard/${scheduleId}/faculty`}>
          <DashboardSidebarItem title="Faculty">
            <User width={40} height={40} />
          </DashboardSidebarItem>
        </Link>
        <Link href={`/dashboard/${scheduleId}/buildings`}>
          <DashboardSidebarItem title="Buildings">
            <Building width={40} height={40} />
          </DashboardSidebarItem>
        </Link>
      </Menu>
    </div>
  );
};

export default React.memo(DashboardSidebar);
