import React from "react";

interface DashboardProps {
  children?: React.ReactNode;
}

// Ensures all children have flex
const DashboardLayout = ({ children }: DashboardProps) => {
  return (
    <div className="flex h-full w-full bg-primary-content">{children}</div>
  );
};

export default DashboardLayout;
