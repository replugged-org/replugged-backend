import {
  type JSX,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h
} from 'preact';
import { useContext } from 'preact/hooks';
import { useRouter } from 'preact-router';
import { useTitleTemplate } from 'hoofd/preact';
import { UserFlags } from '../../../../shared/flags.js';

import Spinner from './Spinner';
import Redirect from './Redirect';
import UserContext from '../UserContext';
import { Endpoints } from '../../constants';

type AuthBoundaryProps = {
  children: JSX.Element,
  staff?: boolean
} & Record<string, unknown>

export default function AuthBoundary ({ children, staff }: AuthBoundaryProps) {
  const user = useContext(UserContext);
  const [ { url: path } ] = useRouter();

  if (user === void 0) {
    useTitleTemplate('Replugged');

    return (
      <main>
        <Spinner />
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <h1>You must be authenticated to see this!</h1>
        <p>
          {/* @ts-ignore */}
          <a href={`${Endpoints.LOGIN}?redirect=${path}`} native>Login</a>
        </p>
      </main>
    );
  }

  if (staff && ((user?.flags ?? 0) & UserFlags.STAFF) === 0) {
    return <Redirect to='/' />;
  }

  return children;
}
