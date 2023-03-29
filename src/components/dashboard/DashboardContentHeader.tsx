import React from "react";
import { Breadcrumbs } from "react-daisyui";
import { Menu, Menu2 } from "tabler-icons-react";

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
          className="mr-5 w-[25px] rounded-md p-1 hover:cursor-pointer hover:bg-base-200"
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
