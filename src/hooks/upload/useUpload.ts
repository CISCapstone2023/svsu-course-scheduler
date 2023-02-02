import { useState } from "react";
import axios from "axios";

const defaults = {};

const defaultOptions = {
  getSignedUrlOptions: {
    method: "get",
  },
  ...defaults,
};

const useRestUpload = (url: string) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);

    const dataForm = new FormData();
    dataForm.append("excel", file);

    await axios({
      method: "post",
      data: dataForm,
      url,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total != undefined) {
          const newProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(newProgress);
        }
      },
    });

    setUploading(false);
  };

  const reset = () => {
    setProgress(0);
  };

  return { upload, progress, uploading, reset };
};

export default useRestUpload;
