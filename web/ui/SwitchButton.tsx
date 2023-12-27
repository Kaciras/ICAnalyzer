import { noop } from "@kaciras/utilities/browser";
import { ChangeEvent } from "react";
import clsx from "clsx";
import { CheckBoxProps } from "./CheckBoxBase.tsx";
import styles from "./SwitchButton.scss";

export type SwitchButtonProps = Omit<CheckBoxProps, "children">;

export default function SwitchButton(props: SwitchButtonProps) {
	const {
		className, name, value, checked, disabled,
		onClick, onChange = noop, onCheckedChange = noop, onSelected = noop,
	} = props;

	const clazz = clsx(
		styles.container,
		className,
		disabled && styles.disabled,
		checked && styles.checked,
	);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const { checked } = e.currentTarget;
		if (checked) {
			onSelected(value);
		}
		onChange(e);
		onCheckedChange(checked);
	}

	return (
		<label className={clazz}>
			<input
				type="checkbox"
				className={styles.input}
				disabled={disabled}
				checked={checked}
				name={name}
				value={value as string}
				onClick={onClick}
				onChange={handleChange}
			/>
		</label>
	);
}
