import classNames from "classnames";
import React from "react";
import { Menu } from "react-daisyui";

/**
 * Dashboard Sidebar Item Properties
 *
 * Default properties for this component
 *
 * @author CIS 2023
 */
interface DashboardSidebarItemProps {
  children?: React.ReactNode;
  title: string;
  className?: string;
  bold?: boolean;
  large?: boolean;
  active?: boolean;
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
  active = false, //By default the active is false
}: DashboardSidebarItemProps) => {
  return (
    <Menu.Item>
      {/* Layout of menu item */}
      <div
        className={classNames(
          "mx-1 mt-1 flex min-h-[50px] items-center rounded-md pl-2 hover:bg-accent-focus hover:text-white",
          {
            "bg-base-300 text-primary": active, //Only when active change the color of the text
          }
        )}
      >
        {/* divs layout picture for menu item and title of menu item */}
        {children && (
          <div
            className={classNames("h-[40px] w-[40px]", {
              "text-black": active, //Only when active check the color of the icon
            })}
          >
            {/**Image via the children slot*/} {children}
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
