import type { NextPage } from "next";
import { useSession, signOut } from "next-auth/react";
import { Hero } from "react-daisyui";
import { routeNeedsAuthSession } from "src/server/auth";

const Dashboard: NextPage = () => {
  /**
   * useSession
   *
   * A function provided by the NextJSAuth library which provides data about the user
   * assuming they are successfully signed-in. If they are it will be null.
   */
  const { data } = useSession();

  return (
    <Hero className="min-h-screen bg-base-200">
      <Hero.Content>
        <div className="max-w-lg">
          <h1 className="text-center text-5xl font-bold leading-snug text-gray-400">
            You are logged in!
          </h1>
          <p className="my-4 text-center leading-loose">
            You are allowed to visit this page because you have a session,
            otherwise you would be redirected to the login page.
          </p>
          <div className="my-4 rounded-lg bg-base-100 p-4">
            <pre>
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </div>
          <div className="text-center">
            <button
              className="btn-secondary btn"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </button>
          </div>
        </div>
      </Hero.Content>
    </Hero>
  );
};

export default Dashboard;

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
