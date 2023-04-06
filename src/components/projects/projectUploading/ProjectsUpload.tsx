import { ScheduleRevision } from "@prisma/client";
import React, {
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, FileInput, Progress } from "react-daisyui";

import useRestUpload from "src/hooks/upload/useUpload";

interface ProjectsUploadProps {
  children?: React.ReactNode;
  onFinish?: (data: IOnboarding | undefined) => void;
  resetFlag: boolean;
  resetForm?: React.Dispatch<React.SetStateAction<boolean>>;
  setStage: (stage: number) => void;
}

interface IOnboarding {
  tuid: string;
  table: Array<Array<string>>;
}
/**
 * ProjectsUpload
 * Generates the first stage elements
 * @Author Binh Dang
 */
const ProjectsUpload = ({
  onFinish,
  resetForm,
  resetFlag,
  setStage,
}: ProjectsUploadProps) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const formInput = useRef<HTMLInputElement>(null);

  const { upload, progress, uploading, reset } = useRestUpload<IOnboarding>(
    `/api/revision/uploadExcel`
  );

  const ResetUploading = () => {
    setMessage("");
    setError(false);
    setStage(1);
    reset();

    if (formInput.current != null) formInput.current.value = "";
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0); //Get the file from the "Iterator"
    if (file != null) {
      //File size can't be bigger than 1mb currently
      if (file.size > 5000000) {
        setMessage("Sorry but that file size was a little big to test with!");
        return;
      }
      //Now attempt to upload the file to the application
      console.log("ATTEMPTING TO UPLOAD");
      let data: IOnboarding = { tuid: "0", table: [["null"]] };
      try {
        data = await upload(file, {});
      } catch (error: any) {
        setError(true);
      }
      data.tuid === undefined ? setError(true) : setError(false);
      if (onFinish) onFinish(data);
    } else {
      setMessage("Invalid file! Please Try Again.");
      return;
    }
  };
  useEffect(() => {
    if (resetFlag) {
      ResetUploading();

      if (resetForm !== undefined) resetForm(false);
      resetFlag = false;
    }
  }, [resetFlag]);

  return (
    <div className="flex flex-col justify-between justify-items-center">
      {!error && uploading && <span>uploading...</span>}
      <FileInput
        accept=".xlsx,.xls"
        max-size="1024"
        disabled={progress === 100 ? true : false}
        onChange={onFileChange}
        ref={formInput}
        type="file"
      />
      <br />
      {!error && uploading ? (
        <Progress color="success" />
      ) : (
        <Progress max="100" value={progress} color="success" />
      )}

      <span className="justify-center">
        {error ? "Invalid file!" : progress + "%"}
      </span>

      {progress === 100 && !uploading && (
        <>
          {/* <p >url: {url}</p> */}
          <Button onClick={ResetUploading} color="ghost">
            Reset
          </Button>

          {message && <p className="font-thin">{message}</p>}
        </>
      )}

      {/* If upload fail let the user try again */}
      {error && (
        <>
          <Button onClick={ResetUploading} color="error">
            Try Again!
          </Button>
        </>
      )}
    </div>
  );
};

export default ProjectsUpload;
