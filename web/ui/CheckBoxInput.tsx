import React, { ChangeEvent, Dispatch, ReactNode } from "react";
import clsx from "clsx";
import CheckIcon from "../assets/check_box.svg";
import CheckIconActive from "../assets/check_box-checked.svg";
import { NOOP } from "../utils";
import Styles from "./CheckBoxInput.scss";

interface Props {
	checked: boolean;
	name?: string;
	disabled?: boolean;
	onChange?: Dispatch<ChangeEvent<HTMLInputElement>>;
	children?: ReactNode;
}

export default function CheckBoxInput(props: Props) {
	const { name, children, checked, disabled, onChange = NOOP } = props;
	return (
		<label className={Styles.container}>
			<input
				type="checkbox"
				className={Styles.input}
				name={name}
				disabled={disabled}
				onChange={onChange}
			/>
			<span
				className={clsx(Styles.mark, { [Styles.checked]: checked })}
			>
				{checked ? <CheckIconActive/> : <CheckIcon/>}
			</span>
			<span className={Styles.label}>{children}</span>
		</label>
	);
}
