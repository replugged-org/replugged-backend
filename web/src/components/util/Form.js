import { useState, useCallback, useMemo, useEffect } from 'preact/hooks';
import ChevronDown from 'feather-icons/dist/icons/chevron-down.svg';
import style from './form.module.css';
import sharedStyle from '../shared.module.css';
function useField(note, error, rk) {
    const [prevError, setPrevError] = useState(error);
    const [showError, setShowError] = useState(Boolean(error));
    const onChange = useCallback(() => {
        if (showError) {
            setShowError(false);
            setPrevError(null);
        }
    }, [showError]);
    const id = useMemo(() => Math.random().toString(16).slice(2), []);
    useEffect(() => {
        if (prevError !== error)
            setShowError(Boolean(error));
        setPrevError(error);
    }, [error, rk]);
    return {
        id: id,
        note: !showError ? note : void 0,
        error: showError ? error : void 0,
        onChange: onChange,
    };
}
function BaseField(props) {
    return (<div className={style.field}>
            <label className={style.label} for={props.id}>
                {props.label}
                {props.required && <span className={style.required}>*</span>}
            </label>
            {props.children}
            {props.note && <p className={style.note}>{props.note}</p>}
            {props.error && <p className={sharedStyle.red}>{props.error}</p>}
        </div>);
}
export function TextField(props) {
    const field = useField(props.note, props.error, props.rk);
    const inputElement = (<input type='text' id={field.id} name={props.name} value={props.value} required={props.required} disabled={props.disabled} placeholder={props.placeholder} minLength={props.minLength} maxLength={props.maxLength} className={style.textField} onKeyDown={field.onChange}/>);
    if (props.raw) {
        return inputElement;
    }
    return (<BaseField {...field} label={props.label} required={props.required} id={field.id}>
            {inputElement}
        </BaseField>);
}
export function TextareaField(props) {
    const field = useField(props.note, props.error, props.rk);
    return (<BaseField {...field} label={props.label} required={props.required} id={field.id}>
            <textarea id={field.id} name={props.name} value={props.value} required={props.required} disabled={props.disabled} placeholder={props.placeholder} minLength={props.minLength} maxLength={props.maxLength} className={style.textareaField} onKeyDown={field.onChange}/>
        </BaseField>);
}
export function CheckboxField(props) {
    const field = useField(props.note, props.error, props.rk);
    return (<BaseField {...field} label={props.label} required={props.required} id={field.id}>
            <input type='checkbox' id={field.id} name={props.name} checked={props.value} required={props.required} disabled={props.disabled} className={style.checkboxField} onClick={field.onChange}/>
        </BaseField>);
}
export function SelectField(props) {
    const field = useField(props.note, props.error, props.rk);
    return (<BaseField {...field} label={props.label} required={props.required} id={field.id}>
            <select type='checkbox' id={field.id} name={props.name} value={props.value} required={props.required} disabled={props.disabled} className={style.selectField} onClick={field.onChange}>
                {props.options.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </select>
            {/* @ts-ignore */}
            <ChevronDown className={style.selectArrow}/>
        </BaseField>);
}
