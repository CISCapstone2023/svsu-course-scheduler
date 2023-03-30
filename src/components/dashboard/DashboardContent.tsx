import classNames from "classnames";
import React from "react";

interface DashboardContentProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * DashboardContent
 * Assigns flex layout to children
 * @Author Saturn
 * @returns
 */
const DashboardContent = ({
  children,
  className,
  ...args
}: DashboardContentProps) => {
  return (
    <div
      className={classNames(
        "flex h-full w-full flex-col bg-base-300",
        className
      )}
      {...args}
    >
      {children}
    </div>
  );
};

export default DashboardContent;
