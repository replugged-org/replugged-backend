import { h, Fragment, cloneElement } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import style from './tooltip.module.css';
export default function Tooltip({ children, text, position, align, disabled }) {
    position = position ?? 'top';
    align = align ?? 'left';
    const elementRef = useRef(null);
    const [tooltipElement, tooltipRef] = useState(null);
    const [display, setDisplay] = useState(false);
    const ogOnMouseEnter = children.props.onMouseEnter;
    const onMouseEnter = useCallback((e) => {
        setDisplay(true);
        if (ogOnMouseEnter) {
            ogOnMouseEnter(e);
        }
    }, [ogOnMouseEnter]);
    const ogOnMouseLeave = children.props.onMouseLeave;
    const onMouseLeave = useCallback((e) => {
        setDisplay(false);
        if (ogOnMouseLeave) {
            ogOnMouseLeave(e);
        }
    }, [ogOnMouseLeave]);
    let tooltip = null;
    if (display && elementRef.current) {
        const css = {};
        const className = [style.tooltip];
        const rect = elementRef.current.getBoundingClientRect();
        if (align === 'left' || align === 'left-center') {
            className.push(style.alignLeft);
            if (align === 'left') {
                css.left = rect.x - 3;
            }
            else {
                css.left = rect.x - 12 + (rect.width / 2);
            }
        }
        if (align === 'right' || align === 'right-center') {
            className.push(style.alignRight);
            const innerWidth = document.getElementById('app').getBoundingClientRect().width;
            if (align === 'right') {
                css.right = innerWidth - (rect.x + rect.width);
            }
            else {
                css.right = innerWidth - (rect.x + rect.width) - 12 + (rect.width / 2);
            }
        }
        if (align === 'center') {
            className.push(style.alignCenter);
            const width = tooltipElement ? tooltipElement.getBoundingClientRect().width : 0;
            css.left = rect.x + ((rect.width - width) / 2);
        }
        if (position === 'top') {
            className.push(style.positionTop);
            css.top = rect.y - (tooltipElement ? tooltipElement.getBoundingClientRect().height : 32) - 6;
        }
        if (position === 'bottom') {
            className.push(style.positionBottom);
            css.top = rect.y + rect.height + (tooltipElement ? tooltipElement.getBoundingClientRect().height : 32) + 6;
        }
        tooltip = createPortal(<div ref={tooltipRef} className={className.join(' ')} style={css}>{text}</div>, document.body);
    }
    if (disabled) {
        return children;
    }
    return h(Fragment, null, cloneElement(children, { ref: elementRef, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave }), tooltip);
}
