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
	checked: boolean;

	className?: string;
	name?: string;
	value?: string;
	disabled?: boolean;

	onValueChange?: Dispatch<boolean>;

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
		onClick, onChange = NOOP, onValueChange = NOOP, children,
	} = props;

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		onChange(e);
		onValueChange(e.currentTarget.checked);
	}

	const CheckMark = checked ? IconChecked : Icon;

	return (
		<label className={clsx(styles.container, className)} onClick={onClick}>
			<input
				type={type}
				className={styles.input}
				name={name}
				value={value}
				disabled={disabled}
				checked={checked}
				onChange={handleChange}
			/>
			<CheckMark className={styles.mark}/>
			{children && <span className={styles.label}>{children}</span>}
		</label>
	);
}
