import { noop } from "@kaciras/utilities/browser";
import { ChangeEvent, ComponentProps, Dispatch } from "react";
import { BsFillCaretDownFill } from "react-icons/bs";
import styles from "./SelectBox.scss";

interface SelectBoxProps extends ComponentProps<"select"> {
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
