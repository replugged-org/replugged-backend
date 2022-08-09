import type { Attributes } from 'preact';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';

type StoreProps = Attributes & { kind: 'plugins' | 'themes' }

export default function Store ({ kind }: StoreProps) {
  return <div>owo? {kind}</div>;
}
