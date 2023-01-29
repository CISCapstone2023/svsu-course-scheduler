import classNames from "classnames";
import React from "react";

interface DashboardContentProps {
  children?: React.ReactNode;
  className?: string;
}

const DashboardContent = ({
  children,
  className,
  ...args
}: DashboardContentProps) => {
  return (
    <div className={classNames("flex w-full flex-col", className)} {...args}>
      {children}
    </div>
  );
};

export default DashboardContent;
