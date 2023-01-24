import classNames from "classnames";
import React from "react";
import { Link } from "react-daisyui";

interface ProjectFileProps {
  children?: React.ReactNode;
}

const ProjectFile = ({ children }: ProjectFileProps) => {
  const title = "Project";
  return (
    <div className="border-neutral-900 mx-auto flex h-20 rounded-lg border-2 bg-white">
      <div className="flex h-full w-1/2 items-center justify-start">
        <Link
          // href={}
          className="mx-1 mt-1 flex h-[50px] items-center rounded-md pl-2 hover:bg-accent-focus hover:text-white"
        >
          <div className="h-[40px] w-[40px]">
            {/**Image */} {children}
          </div>

          <div className="pl-3">
            {/**Title */}{" "}
            <h1
              className={classNames({ "font-semibold": true, "text-lg": true })}
            >
              {title}
            </h1>
          </div>
        </Link>
      </div>
      <div className="flex h-full w-1/2 items-center justify-end">
        <div className="text-slate-400">3 Times Ago</div>
        <div className="m-5 inline-block rounded-full border-2 border-gray-800 px-4 py-2 text-xs font-medium uppercase leading-tight text-gray-800 transition duration-150 ease-in-out hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0">
          ?
        </div>
      </div>
    </div>
  );
};

export default ProjectFile;
