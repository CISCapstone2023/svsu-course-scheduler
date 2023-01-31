import React from "react";

interface ProjectLayoutProps {
  children?: React.ReactNode;
}

const ProjectsLayout = ({ children }: ProjectLayoutProps) => {
  return (
    <div className="border-neutral-900 container bottom-0 mx-auto my-auto h-3/4 overflow-y-scroll rounded-lg border-2 border-opacity-50 bg-stone-200 p-4">
      {children}
    </div>
  );
};

export default ProjectsLayout;
