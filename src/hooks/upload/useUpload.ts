import { useState } from "react";
import axios from "axios";

const defaults = {};

const defaultOptions = {
  getSignedUrlOptions: {
    method: "get",
  },
  ...defaults,
};

interface UploadParameters {
  [name: string]: string;
}

const useRestUpload = <T>(url: string) => {
  //Progress and uploading state
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<T>();

  const upload = async (file: File, params?: UploadParameters): Promise<T> => {
    //Create a form for uploading to the database
    const dataForm = new FormData();
    dataForm.append("file", file);

    //Add all parameters for the value
    for (const param in params) {
      const value = params[param];
      //Make sure the value
      if (value != undefined) {
        dataForm.append(param, value);
      }
    }
    setUploading(true);
    try {
      //Now set the axios post out
      const res = await axios<T>({
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

      if (res.status === 200) {
        setData(res.data);
        //Now we are not uploading anymore
        setUploading(false);
        return res.data;
      } else {
        setData(res.data);
        setProgress(0);
        setUploading(false);
        return res.data;
      }
    } catch (error: any) {
      setData(undefined);
      setProgress(0);
      setUploading(false);
      return error.message;
    }
  };

  //Progress reset
  const reset = () => {
    setProgress(0);
  };

  //Upload the files
  return { upload, progress, uploading, reset, data };
};

export default useRestUpload;
