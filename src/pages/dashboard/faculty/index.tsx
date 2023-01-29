//NextJS
import type { NextPage } from "next";
import { useSession } from "next-auth/react";

//Authentication Check
import { routeNeedsAuthSession } from "src/server/auth";
import Dashboard from "src/components/Dashboard";
import Sidebar from "src/components/Sidebar";
import { useState } from "react";
import useRestUpload from "src/hooks/upload/useUpload";

/**
 * Faculty
 *
 * used for adding faculty
 */
const Faculty: NextPage = () => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */
  const {} = useSession();

  return (
    <Dashboard>
      <Sidebar />
      <Rest />
    </Dashboard>
  );
};

export default Faculty;

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
      if (file.size > 1000000) {
        setMessage("Sorry but that file size was a little big to test with!");
        return;
      }
      //Now attempt to upload the file to the application
      console.log("ATTEMPTING TO UPLOAD");
      await upload(file);
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

/**
 * Get Server Side Properties
 *
 * NextJS supports a custom callback, so before a page is returned to the client
 * you can check on the backend, this allows for us to check if the user is
 * authenticated for example.
 *
 * So with this code we wrap the "routeNeedsAuthSession" so the user needs to
 * be signed in for this page to be shown, if its not that function will redirect the
 * user back to the "/" home sign-up page.
 *
 * Also the perk of server props is that it occurs at page load time.
 * Meaning any data we pass into the "props" return object, will be provided
 * as a prop to the "NextPage" below. So for example the {} of the props could
 * contain data which could be used for the front end.
 */

export const getServerSideProps = routeNeedsAuthSession(async () => {
  //NOTE: Passing the entire session to the NextPage will error,
  //which is likely due to undefined values.
  //Ideally just hook with "useSession" in the page
  return { props: {} };
});
