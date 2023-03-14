import React from "react";
import { Breadcrumbs } from "react-daisyui";

interface DashboardContentHeader {
  children?: React.ReactNode;
  title: string;
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
}: DashboardContentHeader) => {
  return (
    <div className="border-gray align-center flex h-[50px] w-full justify-center justify-between border-b-[1px] p-2 ">
      <div className="my-auto flex">
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="">{children}</div>
    </div>
  );
};

export default DashboardContentHeader;
