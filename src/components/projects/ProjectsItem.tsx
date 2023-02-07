import React, { useState } from "react";
import { Button } from "react-daisyui";
import { Book2, CaretDown, CaretUp } from "tabler-icons-react";

interface ProjectItemProps {
  children?: React.ReactNode;
  strTitle?: string;
  strTimesAgo?: string;
}

const ProjectItem = ({ children, strTitle, strTimesAgo }: ProjectItemProps) => {
  const [isCaretDown, setCaret] = useState(true);

  return (
    <div className="flex-col border-2">
      <div className=" mx-auto flex h-20 rounded-lg   bg-white">
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
          <Button
            onClick={(isCaretDown) => setCaret((isCaretDown) => !isCaretDown)}
            variant="outline"
            className="m-5 inline-block "
          >
            {isCaretDown ? <CaretDown /> : <CaretUp />}
          </Button>
        </div>
      </div>
      {isCaretDown ? (
        <></>
      ) : (
        <div className=" duration-5000 flex h-auto transform flex-wrap justify-end rounded-lg  transition duration-1000 ease-in-out">
          {children}
        </div>
      )}
    </div>
  );
};

export default ProjectItem;
