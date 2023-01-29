//NextJS
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { useCallback, useState } from "react";

//Authentication
import { signIn } from "next-auth/react";

//React Form Hooks
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";

//Authentication Validations
import { signInSchema, type ISignIn } from "src/validation/auth";

//Backend API Remote Procedure Calls (via tRPC)
import { Button, Card, Input } from "react-daisyui";
import { useRouter } from "next/router";
import { routeNeedsAuthSession } from "src/server/auth";

/**
 * Home Page
 *
 * This is the homepage where the user will sign in for the application.
 * The authentication for said application is provided by the next-auth
 *
 * @returns ReactNode
 */
const Home: NextPage = () => {
  /**
   * Login Form Hook
   *
   * This useForm hook uses the Login type [hover over the ILogin] which describe what the Login form has.
   * That type was created in the "validations/auth" folder using the Zod validation library.
   * The "useForm" function returns a object that can be destructed, which means variables can be pulled
   * out of a object. The useForm provides a list of functions [yellow].
   *
   * These provided functions be called by other components to handle login, error state, and
   *
   */
  const { register, setError, formState, handleSubmit } = useForm<ISignIn>({
    resolver: zodResolver(signInSchema),
  });

  /**
   * SignIn State
   *
   * Keeps a state if the user is signing in, which is used to show the loading spinner
   * in the login button.
   */
  const [signInStatus, setSignInStatus] = useState(false);

  /**
   * Router Hook
   *
   * Allows for the client side to redirect the user when needed, like after a API request.
   */
  const router = useRouter();

  /**
   * On Submit (Callback Hook)
   *
   * This hook is used for submitting the sign in request to the server.
   *
   * Unlike the React Mounted hook above where that one runs on renders,
   * this one is set to a variable constant known as "onSubmit". This means
   * we can implicitly call this variable like a function, but it also
   * means if we call it multiple times it will NOT be re-created kind.
   *
   * Because of the nature of React, making normal function without a
   * useCallback would create a memory leak in the application/slow it down
   * heavily.
   */
  const onSubmit = useCallback(
    async (data: ISignIn) => {
      setSignInStatus(true); //Set the loading to true

      //Sign in via credentials and wait for the status
      const value = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      //If its a success they logged in was verified
      if (value?.status === 200) {
        //Send the use to the dashboard
        router.push("/projects");
      } else {
        //If it was wrong, show an error
        setError("password", {
          message: "Invalid Email or Password",
        });
        setSignInStatus(false);
      }
    },
    [router, setError]
  );
  /**
   * React Render (return)
   *
   * This is where the JSX (HTML in JavaScript/TypeScript) goes for a React Component.
   *
   * Component List:
   * - Head: Allows for setting the <head> HTMl element within React
   * - ErrorMessage: Provides an error message for the Form Hook.
   *                 This is provided by the react-hook library.
   * - Card: A custom UI component from daisy, basically a Card like Bootstrap
   * - Input: A custom UI component from daisy for input
   *
   * - Link: Basically a fancy <a> (anchor) tag is used by the NextJS library to move to a page.
   *         Stick to using the <Link> component and don't use <a> (anchor) tags.
   *
   * Functions:
   * - Sets the head content of the page
   * - Creates a form for the user to enter the username and password
   * - The form has an event that will submit the sign-in information to the "handleSubmit"
   *   which is provided by the "react-hook-forms" library. This can be found here
   *
   * TODO: Add a functon
   */
  return (
    <div>
      <Head>
        <title>Next App - Sign Up</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <form
          className="flex h-screen w-full items-center justify-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Card className="bg-base xl w-96 shadow-xl">
            <Card.Body>
              <h2 className="card-title">Welcome back!</h2>
              <p>Email</p>
              <Input
                title="Email"
                placeholder="example@example.com"
                color={formState.errors.email ? "error" : "primary"}
                {...register("email")}
              />
              <ErrorMessage
                errors={formState.errors}
                name="email"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
              <p>Password</p>
              <Input
                type="password"
                color={formState.errors.password ? "error" : "primary"}
                placeholder="Password..."
                {...register("password")}
              />
              <ErrorMessage
                errors={formState.errors}
                name="password"
                render={({ message }) => (
                  <p className="font-semibold text-red-600">{message}</p>
                )}
              />
              <Card.Actions className="items-center justify-between">
                <Link href="/sign-up" className="link">
                  Go to sign up
                </Link>
                <Button
                  className={`btn-primary btn ${signInStatus && "loading"}`}
                  type="submit"
                  disabled={signInStatus}
                >
                  Sign In
                </Button>
              </Card.Actions>
            </Card.Body>
          </Card>
        </form>
      </main>
    </div>
  );
};
export default Home;

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
 * Now instead if the user IS logged in we want to redirect them to the dashboard instead.
 */
export const getServerSideProps = routeNeedsAuthSession(
  async (ctx, session) => {
    //This will still occur but the session will need to be checked manually now
    if (session != null) {
      return {
        redirect: {
          destination: "/dashboard", //Path to the Login Screen
          permanent: false,
        },
      };
    }
    //If nothing happens just return props that are empty
    return { props: {} };
  },
  false //This disables te redirect back to the "/" root
);
