import type { NextPage } from "next";
import { useSession } from "next-auth/react";

import DashboardLayout from "src/components/dashboard/DashboardLayout";
import DashboardSidebar from "src/components/dashboard/DashbaordSidebar";

import { routeNeedsAuthSession } from "src/server/auth";
import { useState } from "react";
import useRestUpload from "src/hooks/upload/useUpload";

import DashboardContent from "src/components/dashboard/DashboardContent";
import { Button } from "react-daisyui";
import DashboardContentHeader from "src/components/dashboard/DashboardContentHeader";
import DashboardHomeTabs from "src/components/dashboard/home/DashboardHomeTabs";

const Dashboard: NextPage = () => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */
  const {} = useSession();

  return (
    <DashboardLayout>
      <DashboardSidebar />
      <DashboardContent>
        <DashboardContentHeader title="Home">
          <Button>Example Button</Button>
        </DashboardContentHeader>
        <DashboardHomeTabs />
      </DashboardContent>
    </DashboardLayout>
  );
};

export default Dashboard;

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
 * contain data which could be used.
 *
 */

export const getServerSideProps = routeNeedsAuthSession(async () => {
  //NOTE: Passing the entire session to the NextPage will error,
  //which is likely due to undefined values.
  //Ideally just hook with "useSession" in the page
  return { props: {} };
});
