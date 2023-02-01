import classNames from "classnames";
import Link from "next/link";
import React from "react";
import { Menu } from "react-daisyui";

interface DashboardSidebarItemProps {
  children?: React.ReactNode;
  title: string;
  className?: string;
  bold?: boolean;
  large?: boolean;
}

const DashboardSidebarItem = ({
  children,
  title,
  bold,
  large,
}: DashboardSidebarItemProps) => {
  return (
    <Menu.Item>
      <div className="mx-1 mt-1 flex h-[50px] items-center rounded-md pl-2 hover:bg-accent-focus hover:text-white">
        <div className="h-[40px] w-[40px]">
          {/**Image */} {children}
        </div>

        <div className="pl-3">
          {/**Title */}{" "}
          <h1
            className={classNames({ "font-semibold": bold, "text-lg": large })}
          >
            {title}
          </h1>
        </div>
      </div>
    </Menu.Item>
  );
};

export default DashboardSidebarItem;
