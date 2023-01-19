import classNames from "classnames";
import Link from "next/link";
import React from "react";

interface SidebarItemProps {
  children?: React.ReactNode;
  title: string;
  url: string;
  className?: string;
  bold?: boolean;
  large?: boolean;
}

const SidebarItem = ({
  children,
  title,
  url,
  bold,
  large,
}: SidebarItemProps) => {
  return (
    <Link
      href={url}
      className="mx-1 mt-1 flex h-[50px] items-center rounded-md pl-2 hover:bg-accent-focus hover:text-white"
    >
      <div className="h-[40px] w-[40px]">
        {/**Image */} {children}
      </div>

      <div className="pl-3">
        {/**Title */}{" "}
        <h1 className={classNames({ "font-semibold": bold, "text-lg": large })}>
          {title}
        </h1>
      </div>
    </Link>
  );
};

export default SidebarItem;
