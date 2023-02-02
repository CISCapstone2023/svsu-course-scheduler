import React, { useState } from "react";
import useRestUpload from "src/hooks/upload/useUpload";

interface ProjectsUploadProps {
  children?: React.ReactNode;
}

const ProjectsUpload = ({ children }: ProjectsUploadProps) => {
  return (
    <div>
      <Rest />
    </div>
  );
};

const Rest = () => {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  const { upload, progress, uploading, reset } = useRestUpload(
    `http://localhost:3000/api/revision/uploadExcel`
  );

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
      await upload(file, {
        id: "thing",
      });
    } else {
      setMessage("Invalid file?");
      return;
    }
  };

  return (
    <>
      {uploading && <span>uploading...</span>}
      <input
        max-size="1024"
        disabled={uploading}
        onChange={onFileChange}
        type="file"
      />
      <br />
      <progress max="100" value={progress} />
      <span>{progress}%</span>
      {progress === 100 && !uploading && (
        <>
          <p>url: {url}</p>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </>
      )}
      {message && <p>{message}</p>}
    </>
  );
};

export default ProjectsUpload;
