import {
	ChangeEvent,
	ChangeEventHandler,
	ComponentType,
	Dispatch,
	MouseEventHandler,
	ReactNode,
	SVGProps,
} from "react";
import clsx from "clsx";
import { NOOP } from "../utils";
import styles from "./CheckBoxBase.scss";

export interface CheckBoxProps {
	checked?: boolean;

	className?: string;
	name?: string;
	disabled?: boolean;

	// The value of the component. The DOM API casts this to a string.
	value?: unknown;

	onCheckedChange?: Dispatch<boolean>;
	onClick?: MouseEventHandler;
	onChange?: ChangeEventHandler<HTMLInputElement>;

	children?: ReactNode;
}

interface InternalProps extends CheckBoxProps {
	type: string;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
	IconChecked: ComponentType<SVGProps<SVGSVGElement>>;
}

export default function CheckBoxBase(props: InternalProps) {
	const {
		className, type, Icon, IconChecked, name, value, checked, disabled,
		onClick, onChange = NOOP, onCheckedChange = NOOP, children,
	} = props;

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		onChange(e);
		onCheckedChange(e.currentTarget.checked);
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
			{children && <span className={styles.label}>{children}</span>}
		</label>
	);
}
