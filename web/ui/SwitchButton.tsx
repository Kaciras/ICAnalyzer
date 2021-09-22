import { ChangeEvent } from "react";
import clsx from "clsx";
import { CheckBoxProps } from "./CheckBoxBase";
import { NOOP } from "../utils";
import styles from "./SwitchButton.scss";

export type SwitchButtonProps = Omit<CheckBoxProps, "children">;

export default function SwitchButton(props: SwitchButtonProps) {
	const {
		className, name, checked, disabled,
		onClick, onChange = NOOP, onCheckedChange = NOOP,
	} = props;

	const clazz = clsx(
		styles.container,
		className,
		disabled && styles.disabled,
		checked && styles.checked,
	);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		onChange(e);
		onCheckedChange(e.currentTarget.checked);
	}

	return (
		<label className={clazz}>
			<input
				type="checkbox"
				className={styles.input}
				disabled={disabled}
				checked={checked}
				name={name}
				onClick={onClick}
				onChange={handleChange}
			/>
		</label>
	);
}
