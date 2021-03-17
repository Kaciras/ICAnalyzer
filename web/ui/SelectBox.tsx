import { SelectHTMLAttributes } from "react";
import CaretDownIcon from "bootstrap-icons/icons/caret-down-fill.svg";
import styles from "./SelectBox.scss";

type SelectBoxProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectBox(props: SelectBoxProps) {
	return (
		<div className={styles.container}>
			<select {...props} className={styles.select}/>
			<CaretDownIcon className={styles.icon}/>
		</div>
	);
}
