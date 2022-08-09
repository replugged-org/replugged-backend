// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { lazy, Suspense } from 'preact/compat';
import { useTitleTemplate, useMeta } from 'hoofd/preact';
import { useCallback, useMemo } from 'preact/hooks';
import Router, { Route } from 'preact-router';

import UserContext, { type User } from './UserContext';
import Spinner from './util/Spinner';

import Header from './layout/Header';
import Footer from './layout/Footer';

import Homepage from './Homepage';
import Account from './account/Account';
import Contributors from './Contributors';
import Stats from './stats/Community';
import Branding from './Branding';
import Storefront from './store/Storefront';
import Documentation from './docs/Documentation';
import Markdown from './docs/Markdown';
import Terms from './legal/Terms';
import Privacy from './legal/Privacy';

const Admin = lazy(() => import('./backoffice/Admin'));


import { SoonRoute } from './util/Soon';

import NotFound from './NotFound';

import { Routes } from '../constants';
import AuthBoundary from './util/AuthBoundary';


type AppProps = {
  user?: null | User,
  url?: string,
  ctx?: Record<string, any>
}

export default function App (props: AppProps) {
  const change = useCallback(() => typeof document !== 'undefined' && document.getElementById('app')?.scrollTo(0, 0), []);
  const loading = useMemo(() => (
    <main>
      <Spinner />
    </main>
  ), []);

  useTitleTemplate('%s • Replugged');
  useMeta({ name: 'og:title',
    content: 'Replugged' });
  useMeta({ name: 'og:site_name',
    content: 'Replugged' });
  useMeta({ name: 'og:description',
    content: 'A lightweight Discord client mod focused on simplicity and performance.' });
  useMeta({ name: 'description',
    content: 'A lightweight Discord client mod focused on simplicity and performance.' });


  return (
    <UserContext.Provider value={props?.user}>
      <Header />
      <Suspense fallback={loading}>
        <Router url={props?.url} onChange={change}>
          <Route path={Routes.HOME} component={Homepage} />
          <Route path={Routes.ME} component={AuthBoundary}>
            <Account />
          </Route>

          <Route path={Routes.CONTRIBUTORS} component={Contributors} />
          <Route path={Routes.STATS} component={Stats} />
          <Route path={Routes.BRANDING} component={Branding} />

          <Route path={Routes.STORE} component={Storefront} />

          <Route path={Routes.DOCS_ITEM(':categoryId?', ':documentId?')} component={SoonRoute}>
            <Documentation path={Routes.DOCS_ITEM(':categoryId?', ':documentId?')} />
          </Route>

          <Route path={Routes.FAQ} component={Markdown} document='faq' />
          <Route path={Routes.INSTALLATION} component={Markdown} document='installation' />
          <Route path={Routes.GUIDELINES} component={Markdown} document='guidelines' />

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
  );
}
