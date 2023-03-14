import React from "react";

interface ProjectLayoutProps {
  children?: React.ReactNode;
}

const ProjectsLayout = ({ children }: ProjectLayoutProps) => {
  return (
    <div className="border-neutral-900 container mx-auto h-3/5 overflow-y-scroll rounded-lg border-2 border-opacity-50 bg-stone-200 p-4">
      {children}
    </div>
  );
};

export default ProjectsLayout;
