import {
    type Attributes
} from 'preact'
import { route } from 'preact-router';
import { useEffect } from 'preact/hooks';

type RedirectProps = Attributes & { to: string };

export default function RedirectProps({ to }: RedirectProps): null {
    useEffect(() => void route(to), []);
    return null;
}