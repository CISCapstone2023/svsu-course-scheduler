//NextJS
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

//tRPC API
import { api } from "src/utils/api";

//Import some CSS for Tailwind
import "src/styles/globals.css";

//React DaisyUI
import { Theme } from "react-daisyui";

//Import the Notificaitons container and styles
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// minified version is also included
/**
 * NextJS Middleware Wrapper
 *
 * This is a middleware wrapper for NextJS.
 * For any page that gets loaded, the <Component>
 * can be wrapped with providers to present
 * functionality for the page.
 *
 * By using the middleware we can useSession anywhere
 * in the application, as its globally accessible via
 * a provider.
 *
 * The same can be true about the theme for daisy,
 * allowing for all children components to be styled
 * directly.
 *
 * This MyApp component thus gets returned as a tRPC middleware too
 * but this is wrapped and taken care of by the api utility class.
 */
const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <Theme dataTheme="emerald" id="theme">
      <SessionProvider session={session}>
        <ToastContainer />
        <Component {...pageProps} />
      </SessionProvider>
    </Theme>
  );
};

//Export the
export default api.withTRPC(MyApp);
