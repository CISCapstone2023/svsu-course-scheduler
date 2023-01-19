import React from "react";

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
  return <div className="flex h-full w-full bg-gray-200">{children}</div>;
};

export default Dashboard;
