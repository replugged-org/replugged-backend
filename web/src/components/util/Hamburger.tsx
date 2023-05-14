import { useEffect, useCallback } from "preact/hooks";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from "preact";

import style from "./hamburger.module.css";

type HamburgerProps = {
  opened: boolean;
  setOpened: (o: boolean) => void;
  className?: string;
};

export default function Hamburger({ opened, setOpened, className }: HamburgerProps) {
  const open = useCallback(() => setOpened(true), [opened]);
  const close = useCallback(() => setTimeout(() => setOpened(false), 0), []);

  useEffect(() => {
    if (opened) {
      window.addEventListener("click", close, true);
      return () => window.removeEventListener("click", close, true);
    }
  }, [opened]);

  return (
    <div
      className={[style.burgerking, opened && style.opened, className].filter(Boolean).join(" ")}
      onClick={open}>
      <span />
      <span />
      <span />
    </div>
  );
}
