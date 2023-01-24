import React from "react";

interface RecentProjectProps {
  children?: React.ReactNode;
}

const RecentProject = ({ children }: RecentProjectProps) => {
  return (
    <div className="overrflow-auto border-neutral-900 container mx-auto my-auto h-1/2 rounded-lg border-2 border-opacity-50 bg-stone-200 p-4">
      {children}
    </div>
  );
};

export default RecentProject;
