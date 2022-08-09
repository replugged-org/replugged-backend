import { h, render, hydrate } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import {
  type User
} from './components/UserContext';
import { Endpoints } from './constants';
import App from './components/App';
import './main.css';

declare global {
  interface Window {
    HAS_TOKEN?: boolean
  }
}

function Wrapper () {
  const [ user, setUser ] = useState<User | null | undefined>(void 0);
  useEffect(() => {
    if (window.HAS_TOKEN !== false) {
      fetch(Endpoints.USER_SELF)
        .then((r) => r.json())
        .then((u) => {
          if (u._id) {
            const patch = ((newUser: Partial<User>): void => setUser((oldUser) => <User>({ ...oldUser,
              ...newUser,
              patch })));
            setUser({ ...u,
              patch });
            return;
          }

          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, []);
  return h(App, { user });
}

if (import.meta.env.DEV) {
  render(h(Wrapper, null), document.querySelector('#app')!);
} else {
  hydrate(h(Wrapper, null), document.querySelector('#app')!);
}
