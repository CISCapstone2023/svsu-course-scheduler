import router from "next/router";
import React, { useState } from "react";
import { Button } from "react-daisyui";
import { toast } from "react-toastify";
import { api } from "src/utils/api";
import { Book2, CaretDown, CaretUp, Trash } from "tabler-icons-react";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
const goToProject = (id: string) => {
  const urlProject: string = "/dashboard/" + id + "/home";
  router.push(urlProject);
};
interface ProjectItemProps {
  children?: React.ReactNode;
  strTitle?: string;
  onDelete?: () => void;
  hasRevision: boolean;
  strTimesAgo?: string;
  id: string;
}

const ProjectItem = ({
  children,
  strTitle,
  strTimesAgo,
  onDelete,
  hasRevision,
  id,
}: ProjectItemProps) => {
  const [isCaretDown, setCaret] = useState(true);
  const [confirmation, setConfirmation] = useState(false);

  //api call for remove the current revision uploaded
  const removeRevision = api.projects.deleteScheduleRevision.useMutation();

  //delete revision
  const deleteRevision = async (DeletedTuid: string) => {
    try {
      const response = await removeRevision.mutateAsync({
        tuid: DeletedTuid,
      });

      //If its true, that's a good!
      if (response) {
        toast.success(`Succesfully Remove Revision`, {
          position: toast.POSITION.TOP_RIGHT,
        }); //Then after two seconds redirect the user via the router
        if (onDelete != undefined) onDelete();

        //Else its an error
      } else {
        toast.error(`Failed to Remove Revision`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      // handle error
      toast.error(`Failed to Connect Database`, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return (
    <div className="flex-col border-2">
      <div className=" mx-auto flex h-20 rounded-lg   bg-white">
        <div
          className="flex h-full w-1/2 cursor-pointer items-center justify-start  underline decoration-transparent transition duration-300 ease-in-out hover:decoration-inherit"
          onClick={() => {
            goToProject(id);
          }}
        >
          <Book2 className="h-[40px] w-[40px] pl-4" />
          <div className="pl-3 text-lg font-semibold">
            <span className="text-lg font-semibold ">{strTitle}</span>
          </div>
        </div>
        <div className="flex h-full w-1/2 items-center justify-end">
          <div className="text-slate-400">{strTimesAgo}</div>
          <Button
            onClick={(isCaretDown) => setCaret((isCaretDown) => !isCaretDown)}
            variant="outline"
            className={
              (hasRevision ? "visible" : "invisible") + " m-5 mr-1 inline-block"
            }
          >
            {isCaretDown ? <CaretDown /> : <CaretUp />}
          </Button>
          <Button
            onClick={() => {
              setConfirmation(true);
            }}
            color="error"
            className="m-5 ml-0"
          >
            <Trash />
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

      <ConfirmDeleteModal
        title="Deletion Confirmation"
        message="Are you sure you want to delete this revision?"
        open={confirmation}
        onClose={() => {
          setConfirmation(false);
        }}
        //when confirm, reset everything to the beginning
        onConfirm={() => {
          if (id) deleteRevision(id);
          setConfirmation(false);
        }}
      />
    </div>
  );
};

export default ProjectItem;
