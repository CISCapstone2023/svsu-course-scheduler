import classNames from "classnames";
import React, { useState } from "react";
import { Book2, CaretDown, CaretUp } from "tabler-icons-react";

interface ProjectItemProps {
  children?: React.ReactNode;
  strTitle?: string;
  strTimesAgo?: string;
}

const ProjectItem = ({ children, strTitle, strTimesAgo }: ProjectItemProps) => {
  const [isCaretDown, setCaret] = useState(true);

  return (
    <div className="flex-col">
      <div className="border-neutral-900 mx-auto flex h-20 rounded-lg border-2 bg-white">
        <div className="flex h-full w-1/2 items-center justify-start">
          <Book2 className="h-[40px] w-[40px] pl-4" />
          <div className="pl-3">
            <a
              href="#!"
              className="text-lg font-semibold underline decoration-transparent transition duration-300 ease-in-out hover:decoration-inherit"
            >
              {strTitle}
            </a>
          </div>
        </div>
        <div className="flex h-full w-1/2 items-center justify-end">
          <div className="text-slate-400">{strTimesAgo}</div>
          <div
            onClick={(isCaretDown) => setCaret((isCaretDown) => !isCaretDown)}
            className="m-5 inline-block rounded-full border-2 border-gray-800 px-4 py-2  text-gray-800 transition duration-150 ease-in-out hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0"
          >
            {isCaretDown ? <CaretDown /> : <CaretUp />}
          </div>
        </div>
      </div>
      {isCaretDown ? (
        <></>
      ) : (
        <div className="border-neutral-900 duration-5000 flex h-auto transform flex-wrap justify-end rounded-lg border bg-orange-100 transition duration-1000 ease-in-out">
          {children}
        </div>
      )}
    </div>
  );
};

export default ProjectItem;
