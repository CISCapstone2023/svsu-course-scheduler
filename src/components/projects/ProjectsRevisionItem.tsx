import router from "next/router";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Button } from "react-daisyui";
import { toast } from "react-toastify";
import { api } from "src/utils/api";
import { Trash } from "tabler-icons-react";
import ConfirmDeleteModal from "../ConfirmDeleteModal";

interface ProjectRevisionItemProps {
  children?: React.ReactNode;
  title?: string;
  setID?: Dispatch<SetStateAction<string>>;
  setConfirmation?: Dispatch<SetStateAction<boolean>>;
  id: string;
  timesAgo?: string;
}
const goToProject = (id: string) => {
  const urlProject: string = "/dashboard/" + id + "/home";
  router.push(urlProject);
};
const ProjectRevisionItem = ({
  title,
  id,
  setID,
  setConfirmation,
  timesAgo,
}: ProjectRevisionItemProps) => {
  return (
    <>
      {" "}
      <div className="border-neutral-900 ml-30 flex h-12  w-11/12 rounded-md border-b-2 bg-sky-50 ">
        <div
          className="flex h-full w-1/2 cursor-pointer items-center justify-start text-lg font-semibold  underline decoration-transparent transition duration-300 ease-in-out hover:decoration-inherit"
          onClick={() => {
            goToProject(id);
          }}
        >
          <div className="pl-3">
            <span className="text-lg font-semibold underline decoration-transparent transition duration-300 ease-in-out hover:decoration-inherit">
              {title}
            </span>
          </div>
        </div>
        <div className="mr-4 flex h-full w-1/2 items-center justify-end text-slate-400">
          {timesAgo}
          <Button
            onClick={() => {
              if (setID != undefined) setID(id);
              if (setConfirmation != undefined) setConfirmation(true);
            }}
            color="error"
            className="m-5 ml-5"
            size="xs"
          >
            <Trash size={15} />
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProjectRevisionItem;
