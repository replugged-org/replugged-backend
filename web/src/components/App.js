import { Suspense } from 'preact/compat';
import { useTitleTemplate, useMeta } from 'hoofd/preact';
import { useCallback, useMemo } from 'preact/hooks';
import Router from "preact-router";
import UserContext from './UserContext';
import Spinner from './util/Spinner';
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import Homepage from "./Homepage";
import Account from './account/Account';
import NotFound from './NotFound';
import { Routes } from "../constants";
import AuthBoundary from './util/AuthBoundary';
export default function App(props) {
    const change = useCallback(() => typeof document !== 'undefined' && document.getElementById('app')?.scrollTo(0, 0), []);
    const loading = useMemo(() => (<main>
      <Spinner />
    </main>), []);
    useTitleTemplate('%s • Replugged');
    useMeta({ name: 'og:title', content: 'Replugged' });
    useMeta({ name: 'og:site_name', content: 'Replugged' });
    useMeta({ name: 'og:description', content: 'A lightweight Discord client mod focused on simplicity and performance.' });
    useMeta({ name: 'description', content: 'A lightweight Discord client mod focused on simplicity and performance.' });
    return (<UserContext.Provider value={props?.user}>
      <Header />
      <Suspense fallback={loading}>
        <Router url={props?.url} onChange={change}>
          <Homepage path={Routes.HOME}/>
          <AuthBoundary path={Routes.ME}>
            <Account />
          </AuthBoundary>

          <NotFound ctx={props?.ctx} default/>
        </Router>
      </Suspense>
      <Footer />
    </UserContext.Provider>);
}
