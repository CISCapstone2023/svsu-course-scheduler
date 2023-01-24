import classNames from "classnames";
import React from "react";
import { Book2, CaretDown } from "tabler-icons-react";

interface ProjectFileProps {
  children?: React.ReactNode;
  strTitle?: string;
  strTimesAgo?: string;
}

const ProjectFile = ({ children }: ProjectFileProps) => {
  const title = "Project";
  return (
    <div className="border-neutral-900 mx-auto flex h-20 rounded-lg border-2 bg-white">
      <div className="flex h-full w-1/2 items-center justify-start">
        <Book2 className="pl-4" />
        <div className="pl-3">
          <h1
            className={classNames({ "font-semibold": true, "text-lg": true })}
          >
            {title}
          </h1>
        </div>
      </div>
      <div className="flex h-full w-1/2 items-center justify-end">
        <div className="text-slate-400">3 Times Ago</div>
        <div className="m-5 inline-block rounded-full border-2 border-gray-800 px-4 py-2  text-gray-800 transition duration-150 ease-in-out hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0">
          <CaretDown></CaretDown>
        </div>
      </div>
    </div>
  );
};

export default ProjectFile;
