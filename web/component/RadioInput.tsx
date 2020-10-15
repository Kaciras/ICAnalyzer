import React, { ReactNode } from "react";
import clsx from "clsx";
import Styles from "./RadioInput.scss";

interface Props {
	checked: boolean;
	name: string;
	disabled?: boolean;
	children?: ReactNode;
}

export default function RadioInput(props: Props) {
	const { name, children, checked, disabled } = props;

	return (
		<label className={clsx(Styles.container, { [Styles.checked]: checked })}>
			<input
				type="radio"
				className={Styles.input}
				name={name}
				disabled={disabled}
			/>
			<span className={clsx(Styles.mark, { [Styles.checked]: checked })}/>
			<span className={Styles.label}>{children}</span>
		</label>
	);
}
