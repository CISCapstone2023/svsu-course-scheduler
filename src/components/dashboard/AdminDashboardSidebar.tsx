import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Divider, Menu } from "react-daisyui";
import { Book, Building, CaretLeft, User } from "tabler-icons-react";
import DashboardSidebarItem from "./DashboardSidebarItem";

interface DashboardSidebarProps {
  children?: React.ReactNode;
}

/**
 * AdminDashboardSidebar
 * Generates a full sidebar menu using DashboardSidebarItems
 * @Author Saturn
 * @return
 */

const AdminDashboardSidebar = ({ children }: DashboardSidebarProps) => {
  return (
    <div className="flex h-full w-[220px] flex-col bg-base-200 pt-4">
      <Menu>
        {/* Adds a back button to return to projects page */}
        <Link href={`/projects`}>
          <DashboardSidebarItem title="Projects">
            <CaretLeft width={40} height={40} />
          </DashboardSidebarItem>
        </Link>
        <Divider />

        <div className="flex w-full pl-4">
          <p className="font-bold">Admin</p>
        </div>
        {/* Redirects to courses page when clicked */}
        <Link href={`/admin/courses`}>
          <DashboardSidebarItem title="Courses">
            <Book width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        {/* Redirects to faculty page when clicked */}
        <Link href={`/admin/faculty`}>
          <DashboardSidebarItem title="Faculty">
            <User width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        {/* Redirects to buildings page when clicked */}
        <Link href={`/admin/buildings`}>
          <DashboardSidebarItem title="Buildings">
            <Building width={40} height={40} />
          </DashboardSidebarItem>
        </Link>
      </Menu>
    </div>
  );
};

export default React.memo(AdminDashboardSidebar);
