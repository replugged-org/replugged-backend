import { VNode, h, hydrate, render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { type User } from "./components/UserContext";
import { Endpoints } from "./constants";
import App from "./components/App";
import "./main.css";

declare global {
  interface Window {
    HAS_TOKEN?: boolean;
  }
}

function Wrapper(): VNode {
  const [user, setUser] = useState<User | null | undefined>(void 0);
  useEffect(() => {
    if (window.HAS_TOKEN !== false) {
      fetch(Endpoints.USER_SELF)
        .then((r) => r.json())
        .then((u) => {
          if (u._id) {
            const patch = (newUser: Partial<User>): void =>
              setUser((oldUser) => ({ ...oldUser, ...newUser, patch } as User));
            setUser({ ...u, patch });
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
  render(h(Wrapper, null), document.querySelector("#app")!);
} else {
  hydrate(h(Wrapper, null), document.querySelector("#app")!);
}
