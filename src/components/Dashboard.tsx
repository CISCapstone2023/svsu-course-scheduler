import React from "react";

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
  return (
    <div className="flex h-full w-full bg-primary-content">{children}</div>
  );
};

export default Dashboard;
