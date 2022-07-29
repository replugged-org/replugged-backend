import { useEffect, useCallback } from 'preact/hooks';
import style from './hamburger.module.css';
export default function Hamburger({ opened, setOpened, className }) {
    const open = useCallback(() => setOpened(true), [opened]);
    const close = useCallback(() => setTimeout(() => setOpened(false), 0), []);
    useEffect(() => {
        if (opened) {
            window.addEventListener('click', close, true);
            return () => window.removeEventListener('click', close, true);
        }
    }, [opened]);
    return (<div className={[style.burgerking, opened && style.opened, className].filter(Boolean).join(' ')} onClick={open}>
            <span />
            <span />
            <span />
        </div>);
}
