import React, { Dispatch, ReactNode } from "react";
import clsx from "clsx";
import Styles from "./RadioInput.scss";
import { NOOP } from "../utils";

interface Props {
	checked: boolean;
	name: string;
	disabled?: boolean;
	onChange?: Dispatch<boolean>;
	children?: ReactNode;
}

export default function RadioInput(props: Props) {
	const { name, children, checked, disabled, onChange = NOOP } = props;

	return (
		<label className={Styles.container}>
			<input
				type="radio"
				className={Styles.input}
				name={name}
				disabled={disabled}
				onChange={e => onChange(e.currentTarget.checked)}
			/>
			<span className={clsx(Styles.mark, { [Styles.checked]: checked })}/>
			<span className={Styles.label}>{children}</span>
		</label>
	);
}
