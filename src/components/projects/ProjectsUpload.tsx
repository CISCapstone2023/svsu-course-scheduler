import { ScheduleRevision } from "@prisma/client";
import React, { useState } from "react";
import { Button, FileInput, Progress } from "react-daisyui";
import useRestUpload from "src/hooks/upload/useUpload";

interface ProjectsUploadProps {
  children?: React.ReactNode;
  onFinish?: (data: IOnboarding | undefined) => void;
}

interface IOnboarding {
  tuid: string;
  columns: Array<Array<ScheduleRevision>>;
}

const ProjectsUpload = ({ onFinish }: ProjectsUploadProps) => {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  const { upload, progress, uploading, reset } = useRestUpload(
    `/api/revision/uploadExcel`
  );

  const ResetUploading = () => {
    setMessage("");
    reset();
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
      const data = await upload(file, {});

      if (onFinish) onFinish(data);
    } else {
      setMessage("Invalid file?");
      return;
    }
  };

  return (
    <div className="flex flex-col justify-between justify-items-center">
      {uploading && <span>uploading...</span>}
      <FileInput
        accept=".csv,.xlsx,.xls"
        max-size="1024"
        disabled={progress === 100 ? true : false}
        onChange={onFileChange}
        type="file"
      />
      <br />
      {uploading ? (
        <Progress color="success" />
      ) : (
        <Progress max="100" value={progress} color="success" />
      )}
      <span className="justify-center">{progress}%</span>

      {progress === 100 && !uploading && (
        <>
          {/* <p >url: {url}</p> */}
          <Button onClick={ResetUploading} color="ghost">
            Reset
          </Button>
        </>
      )}
      {message && <p className="font-thin">{message}</p>}
    </div>
  );
};

export default ProjectsUpload;
