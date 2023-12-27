import { noop } from "@kaciras/utilities/browser";
import { ChangeEvent, ChangeEventHandler, Dispatch, MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import { SVGComponent } from "../utils";
import styles from "./CheckBoxBase.scss";

export interface CheckBoxProps {
	checked?: boolean;
	className?: string;
	name?: string;
	disabled?: boolean;

	// The value of the component. The DOM API casts this to a string.
	value?: unknown;

	/**
	 * If the checked state changed, this handler will be called with the value prop.
	 */
	onSelected?: Dispatch<unknown>;

	onCheckedChange?: Dispatch<boolean>;

	onClick?: MouseEventHandler;
	onChange?: ChangeEventHandler<HTMLInputElement>;

	children?: ReactNode;
}

interface InternalProps extends CheckBoxProps {
	type: string;
	Icon: SVGComponent;
	IconChecked: SVGComponent;
}

export default function CheckBoxBase(props: InternalProps) {
	const {
		className, type, Icon, IconChecked, name, value, checked, disabled,
		onClick, onSelected = noop, onChange = noop, onCheckedChange = noop, children,
	} = props;

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const { checked } = e.currentTarget;
		if (checked) {
			onSelected(value);
		}
		onChange(e);
		onCheckedChange(checked);
	}

	const CheckMark = checked ? IconChecked : Icon;

	const clazz = clsx(
		styles.container,
		className,
		disabled && styles.disabled,
	);

	return (
		<label className={clazz} onClick={onClick}>
			<input
				type={type}
				className={styles.input}
				name={name}
				value={value as string}
				disabled={disabled}
				checked={checked}
				onChange={handleChange}
			/>
			<CheckMark className={styles.mark}/>
			{
				children &&
				<span className={styles.label}>{children}</span>
			}
		</label>
	);
}
