import React, { SelectHTMLAttributes } from "react";
import Styles from "./SelectBox.scss";
import CaretDownIcon from "bootstrap-icons/icons/caret-down-fill.svg";

type SelectBoxProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectBox(props: SelectBoxProps) {
	return (
		<div className={Styles.container}>
			<select {...props} className={Styles.select}/>
			<CaretDownIcon className={Styles.icon}/>
		</div>
	);
}
