import { useState } from "react";
import axios from "axios";

//A list of key-value pairs
interface UploadParameters {
  [name: string]: string;
}
/**
 * useRestUpload
 *
 * Allows for uploading a file in react with the generic type
 * which returns proper react state.
 *
 * This returns the upload information, progess amount,
 * if we are uploading, a way to reset, and the data returned.
 *
 * @param url
 * @author Brendan Fuller
 * @returns upload, progress, uploading, reset, data
 */
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
        //Reset progress and upload
        setData(res.data);
        setProgress(0);
        setUploading(false);
        return res.data;
      }
    } catch (error: any) {
      //If an error fully reset the values
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
