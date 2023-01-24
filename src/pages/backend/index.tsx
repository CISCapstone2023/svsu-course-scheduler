//NextJS
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

//Authentication Check
import { routeNeedsAuthSession } from "src/server/auth";
import { api } from "src/utils/api";
import { Loader } from "tabler-icons-react";

/**
 * Backend
 *
 * Test data with backend
 */
const Backend: NextPage = () => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */
  const { data: session } = useSession();

  const [skip, setSkip] = useState(false);
  const { isLoading, data } = api.example.projects.useQuery();
  if (isLoading) return <Loader />;

  return (
    <div>
      {data?.map((element, index) => {
        return (
          <div className="m-3 bg-red-400 p-3" key={index}>
            {element.tuid}
          </div>
        );
      })}
    </div>
  );
};

export default Backend;

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
