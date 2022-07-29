import { route } from 'preact-router';
import { useEffect } from 'preact/hooks';
export default function RedirectProps({ to }) {
    useEffect(() => void route(to), []);
    return null;
}
