import { createPortal } from 'preact/compat';
import Spinner from './Spinner';
import X from 'feather-icons/dist/icons/x.svg';
import style from './modal.module.css';
import sharedStyle from '../shared.module.css';
export default function Modal(props) {
    const btnStyle = `${sharedStyle.button}${props.color && props.color !== 'classic' ? ` ${sharedStyle[props.color]}` : ''}`;
    return createPortal(<div className={style.overlay} onClick={props.onClose}>
            <div className={style.container} onClick={(e) => e.stopPropagation()}>
                <header className={style.header}>
                    <span className={style.title}>{props.title}</span>
                    {/* @ts-ignore */}
                    <X className={style.close} onClick={props.onClose}/>
                </header>
                <div className={style.inner}>{props.children}</div>
                {props.onConfirm && <footer className={style.footer}>
                    <button className={sharedStyle.buttonLink} onClick={props.onClose}>
                        {props.closeText ? props.closeText : 'Cancel'}
                    </button>
                    <button className={btnStyle} onClick={props.onConfirm} disabled={props.processing}>
                        {props.processing ? <Spinner balls/> : props.confirmText ? props.confirmText : 'Confirm'}
                    </button>
                </footer>}
            </div>
        </div>, document.body);
}
