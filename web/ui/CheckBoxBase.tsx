import React, { ChangeEvent, Dispatch, ReactNode } from "react";
import clsx from "clsx";
import { NOOP } from "../utils";
import Styles from "./CheckBoxBase.scss";

export interface CheckBoxProps {
	checked: boolean;
	name?: string;
	disabled?: boolean;
	onChange?: Dispatch<ChangeEvent<HTMLInputElement>>;
	children?: ReactNode;
}

interface InternalProps extends CheckBoxProps {
	Icon: string;
	IconChecked: string;
}

export default function CheckBoxBase(props: InternalProps) {
	const { Icon, IconChecked, name, children, checked, disabled, onChange = NOOP } = props;
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
				{checked ? <IconChecked/> : <Icon/>}
			</span>
			<span className={Styles.label}>{children}</span>
		</label>
	);
}
