import { VNode } from "preact";
import { Suspense, lazy } from "preact/compat";
import { useTitleTemplate } from "hoofd/preact";
import { useCallback, useEffect, useMemo } from "preact/hooks";
import Router, { Route, route } from "preact-router";

import UserContext, { type User } from "./UserContext";
import Spinner from "./util/Spinner";

import Header from "./layout/Header";
import Footer from "./layout/Footer";

import Homepage from "./Homepage";
import Account from "./account/Account";
import Contributors from "./Contributors";
import Download from "./Download";
import Stats from "./stats/Community";
import Branding from "./Branding";
import Install from "./Install";
import Storefront from "./store/Storefront";
import Terms from "./legal/Terms";
import Privacy from "./legal/Privacy";

const Admin = lazy(() => import("./backoffice/Admin"));

import NotFound from "./NotFound";

import { Routes } from "../constants";
import AuthBoundary from "./util/AuthBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

interface AppProps {
  user?: null | User;
  url?: string;
  ctx?: Record<string, unknown>;
}

function Redirect({ to }: { path: string; to: string }): null {
  useEffect(() => {
    route(to, true);
  }, [to]);

  return null;
}

export default function App(props: AppProps): VNode {
  const change = useCallback(
    () => typeof document !== "undefined" && document.getElementById("app")?.scrollTo(0, 0),
    [],
  );
  const loading = useMemo(
    () => (
      <main>
        <Spinner />
      </main>
    ),
    [],
  );

  useTitleTemplate("%s - Replugged");

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={props?.user}>
        <Header />
        <Toaster
          style={{
            marginTop: "72px",
          }}
        />
        <Suspense fallback={loading}>
          <Router url={props?.url} onChange={change}>
            <Route path={Routes.HOME} component={Homepage} />
            <Route path={Routes.DOWNLOAD} component={Download} />
            <Redirect path="/installation" to={Routes.DOWNLOAD} />
            <Route path={Routes.ME} component={AuthBoundary}>
              <Account />
            </Route>

            <Route path={Routes.CONTRIBUTORS} component={Contributors} />
            <Route path={Routes.STATS} component={Stats} />
            <Route path={Routes.BRANDING} component={Branding} />
            <Route path={Routes.INSTALL} component={Install} />

            <Route path={`${Routes.STORE}/:path*`} component={Storefront} />

            <Route path={Routes.TERMS} component={Terms} />
            <Route path={Routes.PRIVACY} component={Privacy} />

            <Route path={`${Routes.BACKOFFICE}/:path*`} component={AuthBoundary} staff>
              <Admin />
            </Route>

            <Route default ctx={props?.ctx} component={NotFound} />
          </Router>
        </Suspense>
        <Footer />
      </UserContext.Provider>
    </QueryClientProvider>
  );
}
