import { ChangeEvent, ChangeEventHandler, Dispatch, MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import { NOOP, SVGComponent } from "../utils";
import styles from "./CheckBoxBase.scss";

export interface CheckBoxProps {
	checked?: boolean;
	className?: string;
	name?: string;
	disabled?: boolean;

	// The value of the component. The DOM API casts this to a string.
	value?: unknown;

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
		onClick, onSelected = NOOP, onChange = NOOP, onCheckedChange = NOOP, children,
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
