import { useTitle } from 'hoofd/preact';
import { Routes } from '../constants';
import style from './notfound.module.css';
export default function NotFound({ ctx, className }) {
    if (import.meta.env.SSR && ctx)
        ctx.notFound = true;
    useTitle('404');
    return (<main className={`${style.container}${className ? ` ${className}` : ''}`}>
            <h1>Seems like you're lost...</h1>
            <p>
                <a href={Routes.HOME}>Go back home</a>
            </p>
        </main>);
}
