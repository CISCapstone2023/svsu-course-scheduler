import router from "next/router";
import React from "react";

interface ProjectRevisionItemProps {
  children?: React.ReactNode;
  title?: string;
  id: string;
  timesAgo?: string;
}
const goToProject = (id: string) => {
  const urlProject: string = "/dashboard/" + id + "/home";
  router.push(urlProject);
};
const ProjectRevisionItem = ({
  children,
  title,
  id,
  timesAgo,
}: ProjectRevisionItemProps) => {
  return (
    <div
      className="border-neutral-900 ml-30  flex h-12 w-11/12 cursor-pointer rounded-md border-b-2 bg-sky-50"
      onClick={() => {
        goToProject(id);
      }}
    >
      <div className="flex h-full w-1/2 items-center justify-start">
        <div className="pl-3">
          <span className="text-lg font-semibold underline decoration-transparent transition duration-300 ease-in-out hover:decoration-inherit">
            {title}
          </span>
        </div>
      </div>
      <div className="mr-4 flex h-full w-1/2 items-center justify-end text-slate-400">
        {timesAgo}
      </div>
    </div>
  );
};

export default ProjectRevisionItem;
