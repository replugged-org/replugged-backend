import type { Attributes, JSX, VNode } from "preact";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cloneElement, h } from "preact";

import style from "./soon.module.css";

export default function Soon(): VNode {
  return (
    <main className={style.container}>
      <img
        className={style.eyes}
        src="https://cdn.discordapp.com/emojis/649415462186254362.webp"
        alt=""
      />
      <div className={style.soon}>Coming soon, come back later!</div>
      <div className={style.uwu}>u cute uwu</div>
    </main>
  );
}

export function SoonRoute({ children, ...props }: Attributes & { children: JSX.Element }): VNode {
  if (import.meta.env.PROD) {
    return <Soon />;
  }

  return cloneElement(children, props);
}
