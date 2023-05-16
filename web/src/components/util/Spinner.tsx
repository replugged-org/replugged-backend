// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VNode, h } from "preact";

import style from "./spinner.module.css";

interface SpinnerProps {
  balls?: boolean;
}

export default function Spinner({ balls }: SpinnerProps): VNode {
  if (balls) {
    return (
      <div className={style.balls}>
        <div className={style.ball} />
        <div className={style.ball} />
        <div className={style.ball} />
      </div>
    );
  }

  return <div className={style.container} />;
}
