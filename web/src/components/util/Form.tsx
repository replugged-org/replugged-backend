import {
  type Attributes,
  type ComponentChild,
  type JSX,
  ComponentChildren,
  VNode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
} from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

import ChevronDown from "feather-icons/dist/icons/chevron-down.svg";

import style from "./form.module.css";
import sharedStyle from "../shared.module.css";

type BaseProps = Attributes & {
  id: string;
  label: ComponentChild;
  note?: ComponentChild;
  error?: ComponentChild;
  children: ComponentChild;
  required?: boolean;
  className?: string;
};

type BaseFieldProps = Attributes & {
  name: string;
  label: ComponentChild;
  note?: ComponentChild;
  error?: ComponentChild;
  required?: boolean;
  disabled?: boolean;
  raw?: boolean;
  rk?: number; // [Cynthia] this is used to force re-render of form fields, to help with errors sometimes not showing up
  fieldClassName?: string;
};

type TextFieldProps = BaseFieldProps & {
  value?: string;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  preview?: ComponentChildren;
};
type CheckboxFieldProps = BaseFieldProps & { value?: boolean };
type SelectFieldProps = BaseFieldProps & {
  onChange: JSX.GenericEventHandler<HTMLSelectElement>;
  value?: string;
  options: Array<{ id: string; name: string }>;
};

interface FieldState {
  id: string;
  note?: ComponentChild;
  error?: ComponentChild;
  onChange: () => void;
}

function useField(note?: ComponentChild, error?: ComponentChild, rk?: number): FieldState {
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
    if (prevError !== error) {
      setShowError(Boolean(error));
    }
    setPrevError(error);
  }, [error, rk]);

  return {
    id,
    note: !showError ? note : void 0,
    error: showError ? error : void 0,
    onChange,
  };
}

function BaseField(props: BaseProps): VNode {
  return (
    <div className={[style.field, props.className].filter(Boolean).join(" ")}>
      <label className={style.label} for={props.id}>
        {props.label}
        {props.required && <span className={style.required}>*</span>}
      </label>
      {props.children}
      {props.note && <p className={style.note}>{props.note}</p>}
      {props.error && <p className={sharedStyle.red}>{props.error}</p>}
    </div>
  );
}

export function TextField(props: TextFieldProps): VNode {
  const field = useField(props.note, props.error, props.rk);
  const inputElement = (
    <input
      type="text"
      id={field.id}
      name={props.name}
      value={props.value}
      required={props.required}
      disabled={props.disabled}
      placeholder={props.placeholder}
      minLength={props.minLength}
      maxLength={props.maxLength}
      className={style.textField}
      onKeyDown={field.onChange}
    />
  );

  if (props.raw) {
    return inputElement;
  }

  return (
    <BaseField {...field} label={props.label} required={props.required} id={field.id}>
      {inputElement}
      {props.preview ? props.preview : null}
    </BaseField>
  );
}

export function TextareaField(props: TextFieldProps): VNode {
  const field = useField(props.note, props.error, props.rk);

  return (
    <BaseField {...field} label={props.label} required={props.required} id={field.id}>
      <textarea
        id={field.id}
        name={props.name}
        value={props.value}
        required={props.required}
        disabled={props.disabled}
        placeholder={props.placeholder}
        minLength={props.minLength}
        maxLength={props.maxLength}
        className={style.textareaField}
        onKeyDown={field.onChange}
      />
    </BaseField>
  );
}

export function CheckboxField(props: CheckboxFieldProps): VNode {
  const field = useField(props.note, props.error, props.rk);

  return (
    <BaseField {...field} label={props.label} required={props.required} id={field.id}>
      <input
        type="checkbox"
        id={field.id}
        name={props.name}
        checked={props.value}
        required={props.required}
        disabled={props.disabled}
        className={style.checkboxField}
        onClick={field.onChange}
      />
    </BaseField>
  );
}

export function SelectField(props: SelectFieldProps): VNode {
  const field = useField(props.note, props.error, props.rk);

  return (
    <BaseField {...field} label={props.label} required={props.required} id={field.id} className={props.fieldClassName}>
      <select
        type="checkbox"
        id={field.id}
        name={props.name}
        value={props.value}
        required={props.required}
        disabled={props.disabled}
        className={style.selectField}
        onClick={field.onChange}
        onChange={props.onChange}>
        {props.options.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
      {/* @ts-expect-error idk */}
      <ChevronDown className={style.selectArrow} />
    </BaseField>
  );
}
