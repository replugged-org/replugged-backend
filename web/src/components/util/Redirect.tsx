import { type Attributes } from "preact";
import { route } from "preact-router";
import { useEffect } from "preact/hooks";

type TRedirectProps = Attributes & { to: string };

export default function RedirectProps({ to }: TRedirectProps): null {
  useEffect(() => void route(to), []);
  return null;
}
