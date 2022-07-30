import { h } from 'preact'
import { lazy, Suspense } from 'preact/compat'
import { useTitleTemplate, useMeta } from 'hoofd/preact'
import { useCallback, useMemo } from 'preact/hooks'
import Router from "preact-router";

import UserContext, { type User } from './UserContext';
import Spinner from './util/Spinner';

import Header from "./layout/Header"
import Footer from "./layout/Footer"

import Homepage from "./Homepage"
import Account from './account/Account';
import Contributors from './Contributors';
import Stats from './stats/Community'
import Branding from './Branding'
import Storefront from './store/Storefront';
import Documentation from './docs/Documentation';
import Markdown from './docs/Markdown'
import Terms from './legal/Terms'
import Privacy from './legal/Privacy';

const Admin = lazy(() => import('./backoffice/Admin'))


import { SoonRoute } from './util/Soon';

import NotFound from './NotFound';

import { Routes } from "../constants"
import AuthBoundary from './util/AuthBoundary';


type AppProps = {
  user?: null | User,
  url?: string,
  ctx?: Record<string, any>
}

export default function App(props: AppProps) {
  const change = useCallback(() => typeof document !== 'undefined' && document.getElementById('app')?.scrollTo(0, 0), []);
  const loading = useMemo(() => (
    <main>
      <Spinner />
    </main>
  ), [])

  useTitleTemplate('%s • Replugged')
  useMeta({ name: 'og:title', content: 'Replugged' })
  useMeta({ name: 'og:site_name', content: 'Replugged' })
  useMeta({ name: 'og:description', content: 'A lightweight Discord client mod focused on simplicity and performance.' })
  useMeta({ name: 'description', content: 'A lightweight Discord client mod focused on simplicity and performance.' })


  return (
    <UserContext.Provider value={props?.user}>
      <Header />
      <Suspense fallback={loading}>
        <Router url={props?.url} onChange={change}>
          <Homepage path={Routes.HOME} />
          <AuthBoundary path={Routes.ME}>
            <Account />
          </AuthBoundary>
          <Contributors path={Routes.CONTRIBUTORS} />
          <Stats path={Routes.STATS} />
          <Branding path={Routes.BRANDING} />

          <SoonRoute path={`${Routes.STORE}/:path*`}>
            <Storefront path={`${Routes.STORE}/:path*`} />
          </SoonRoute>

          <SoonRoute path={Routes.DOCS_ITEM(':categoryId?', ':documentId?')}>
            <Documentation path={Routes.DOCS_ITEM(':categoryId?', ':documentId?')} />
          </SoonRoute>

          <Markdown document='faq' path={Routes.FAQ} />
          <Markdown document='installation' path={Routes.INSTALLATION} />
          <Markdown document='guidelines' path={Routes.GUIDELINES} />

          <Terms path={Routes.TERMS} />
          <Privacy path={Routes.PRIVACY} />


          <AuthBoundary staff path={`${Routes.BACKOFFICE}/:path*`}>
            <Admin />
          </AuthBoundary>
          <NotFound ctx={props?.ctx} default />
        </Router>
      </Suspense>
      <Footer />
    </UserContext.Provider>
  )
}