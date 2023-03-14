import React from "react";

interface DashboardProps {
  children?: React.ReactNode;
}

/**
 * DashboardLayout
 * Ensures all Children have flex
 * @Author Saturn
 * @returns
 */
const DashboardLayout = ({ children }: DashboardProps) => {
  return (
    <div className="flex h-full w-full bg-primary-content">{children}</div>
  );
};

export default DashboardLayout;
