import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Menu } from "react-daisyui";
import { Book, Building, User } from "tabler-icons-react";
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
        <div className="flex w-full pl-4">
          <p className="font-bold">Admin</p>
        </div>
        <Link href={`/admin/courses`}>
          <DashboardSidebarItem title="Courses">
            <Book width={40} height={40} />
          </DashboardSidebarItem>
        </Link>

        <Link href={`/admin/faculty`}>
          <DashboardSidebarItem title="Faculty">
            <User width={40} height={40} />
          </DashboardSidebarItem>
        </Link>
        <Link href={`/admin/buildings`}>
          <DashboardSidebarItem title="Buildings">
            <Building width={40} height={40} />
          </DashboardSidebarItem>
        </Link>
      </Menu>
    </div>
  );
};

export default React.memo(DashboardSidebar);
