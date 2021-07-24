import { ChangeEvent, Dispatch, SelectHTMLAttributes } from "react";
import CaretDownIcon from "bootstrap-icons/icons/caret-down-fill.svg";
import { NOOP } from "../utils";
import styles from "./SelectBox.scss";

type SelectBoxProps = SelectHTMLAttributes<HTMLSelectElement> & {
	onValueChange: Dispatch<string>;
};

export default function SelectBox(props: SelectBoxProps) {
	const { onChange = NOOP, onValueChange, ...others } = props;

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
			<CaretDownIcon className={styles.icon}/>
		</div>
	);
}
