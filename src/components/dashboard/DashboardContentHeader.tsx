import React from "react";
import { Menu2 } from "tabler-icons-react";

/**
 * Dashboard Content Header Properties
 *
 * Default properties for this component
 *
 * @author CIS 2023
 */
interface DashboardContentHeader {
  children?: React.ReactNode;
  title: string;
  onMenuClick?: () => void;
}

/**
 * DashboardContentHeader
 * Is a container for the header
 * @Author Saturn
 * @returns
 */
const DashboardContentHeader = ({
  children,
  title,
  onMenuClick,
}: DashboardContentHeader) => {
  return (
    <div className="border-gray align-center flex min-h-[50px] w-full justify-center justify-between border-b-[1px] p-2 ">
      <div className="my-auto flex">
        <Menu2
          width={30}
          height={30}
          className="mr-5 rounded-md p-1 hover:cursor-pointer hover:bg-base-200"
          onClick={() => {
            if (onMenuClick) {
              onMenuClick();
            }
          }}
        />
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="">{children}</div>
    </div>
  );
};

export default DashboardContentHeader;
