import { ChangeEvent, ChangeEventHandler, ComponentType, Dispatch, ReactNode } from "react";
import clsx from "clsx";
import { NOOP } from "../utils";
import styles from "./CheckBoxBase.scss";

export interface CheckBoxProps {
	className?: string;
	checked?: boolean;
	name?: string;
	disabled?: boolean;

	onValueChange?: Dispatch<boolean>;
	onChange?: ChangeEventHandler<HTMLInputElement>;

	children?: ReactNode;
}

interface InternalProps extends CheckBoxProps {
	type: string;
	Icon: ComponentType;
	IconChecked: ComponentType;
}

export default function CheckBoxBase(props: InternalProps) {
	const {
		className, type, Icon, IconChecked, name, children, checked, disabled,
		onChange = NOOP, onValueChange = NOOP,
	} = props;

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		onChange(e);
		onValueChange(e.currentTarget.checked);
	}

	return (
		<label className={clsx(styles.container, className)}>
			<input
				type={type}
				className={styles.input}
				name={name}
				disabled={disabled}
				checked={checked}
				onChange={handleChange}
			/>
			<span
				className={clsx(styles.mark, { [styles.checked]: checked })}
			>
				{checked ? <IconChecked/> : <Icon/>}
			</span>
			{children && <span className={styles.label}>{children}</span>}
		</label>
	);
}
