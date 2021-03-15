import clsx from "clsx";
import { CheckBoxProps } from "./CheckBoxBase";
import styles from "./SwitchButton.scss";
import { NOOP } from "../utils";
import { ChangeEvent } from "react";
import Omit = jest.Omit;

export type SwitchButtonProps = Omit<CheckBoxProps, "children">;

export default function SwitchButton(props: SwitchButtonProps) {
	const { className, name, checked, disabled, onChange = NOOP, onValueChange = NOOP } = props;

	const clazz = clsx(
		styles.container,
		className,
		{ [styles.checked]: checked },
	);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		onChange(e);
		onValueChange(e.currentTarget.checked);
	}

	return (
		<label className={clazz}>
			<input
				type="checkbox"
				className={styles.input}
				disabled={disabled}
				checked={checked}
				name={name}
				onChange={handleChange}
			/>
		</label>
	);
}
