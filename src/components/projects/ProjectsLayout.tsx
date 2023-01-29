import React from "react";

interface ProjectLayoutProps {
  children?: React.ReactNode;
}

const ProjectsLayout = ({ children }: ProjectLayoutProps) => {
  return (
    <div className="flex h-full w-full bg-primary-content">
      <div className="border-neutral-900 container mx-auto my-auto h-1/2 overflow-scroll rounded-lg border-2 border-opacity-50 bg-stone-200 p-4">
        {children}
      </div>
    </div>
  );
};

export default ProjectsLayout;
