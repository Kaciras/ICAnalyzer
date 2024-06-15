import { noop } from "@kaciras/utilities/browser";
import { ChangeEvent, Dispatch, SelectHTMLAttributes } from "react";
import { BsFillCaretDownFill } from "react-icons/bs";
import styles from "./SelectBox.scss";

interface SelectBoxProps extends SelectHTMLAttributes<HTMLSelectElement> {
	onValueChange: Dispatch<string>;
}

export default function SelectBox(props: SelectBoxProps) {
	const { onChange = noop, onValueChange, ...others } = props;

	function handleChange(e: ChangeEvent<HTMLSelectElement>) {
		onChange(e);
		onValueChange(e.currentTarget.value);
	}

	return (
		<div className={styles.container}>
			<select
				{...others}
				className={styles.select}
				onChange={handleChange}
			/>
			<BsFillCaretDownFill className={styles.icon}/>
		</div>
	);
}
