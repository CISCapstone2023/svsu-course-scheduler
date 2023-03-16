import classNames from "classnames";
import React from "react";
import { Menu } from "react-daisyui";

interface DashboardSidebarItemProps {
  children?: React.ReactNode;
  title: string;
  className?: string;
  bold?: boolean;
  large?: boolean;
}

/**
 * DashboardSidebarItem
 * Container which holds a menu item (this item contains a name and picture)
 * @Author Saturn
 * @returns
 */
const DashboardSidebarItem = ({
  children,
  title,
  bold,
  large,
}: DashboardSidebarItemProps) => {
  return (
    <Menu.Item>
      {/* Layout of menu item */}
      <div className="mx-1 mt-1 flex min-h-[50px] items-center rounded-md pl-2 hover:bg-accent-focus hover:text-white">
        {/* divs layout picture for menu item and title of menu item */}
        {children && (
          <div className="h-[40px] w-[40px]">
            {/**Image */} {children}
          </div>
        )}

        <div className="pl-3">
          {/**Title */}{" "}
          <h1
            className={classNames("break-all", {
              "font-semibold": bold,
              "text-lg": large,
            })}
          >
            {title}
          </h1>
        </div>
      </div>
    </Menu.Item>
  );
};

export default DashboardSidebarItem;
