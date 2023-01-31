import React from "react";

interface ProjectRevisionItemProps {
  children?: React.ReactNode;
  title?: string;
  timesAgo?: string;
}

const ProjectRevisionItem = ({
  children,
  title,
  timesAgo,
}: ProjectRevisionItemProps) => {
  return (
    <div className="border-neutral-900 ml-30 flex h-12 w-11/12 rounded-lg border-2 bg-white">
      <div className="flex h-full w-1/2 items-center justify-start">
        <div className="pl-3">
          <a
            href="#!"
            className="text-lg font-semibold underline decoration-transparent transition duration-300 ease-in-out hover:decoration-inherit"
          >
            {title}
          </a>
        </div>
      </div>
      <div className="mr-4 flex h-full w-1/2 items-center justify-end text-slate-400">
        {timesAgo}
      </div>
    </div>
  );
};

export default ProjectRevisionItem;
