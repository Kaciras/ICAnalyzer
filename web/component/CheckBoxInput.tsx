import React, { ReactNode } from "react";
import clsx from "clsx";
import CheckIcon from "bootstrap-icons/icons/check2.svg";
import Styles from "./CheckBoxInput.scss";

interface Props {
	checked: boolean;
	name?: string;
	disabled?: boolean;
	children?: ReactNode;
}

export default function CheckBoxInput(props: Props) {
	const { name, children, checked, disabled } = props;
	return (
		<label className={Styles.container}>
			<input
				type="checkbox"
				className={Styles.input}
				name={name}
				disabled={disabled}
			/>
			<span
				className={clsx(Styles.mark, { [Styles.checked]: checked })}
			>
				<CheckIcon/>
			</span>
			<span className={Styles.label}>{children}</span>
		</label>
	);
}
