import type { Attributes } from "preact";
import {
  VNode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
} from "preact";

type StoreProps = Attributes & { kind: "plugins" | "themes" };

export default function Store({ kind }: StoreProps): VNode {
  return <div>owo? {kind}</div>;
}
