import { ChangeEvent, ComponentType, Dispatch, ReactNode } from "react";
import clsx from "clsx";
import { NOOP } from "../utils";
import Styles from "./CheckBoxBase.scss";

export interface CheckBoxProps {
	checked?: boolean;
	name?: string;
	disabled?: boolean;
	onChange?: Dispatch<ChangeEvent<HTMLInputElement>>;
	children?: ReactNode;
}

interface InternalProps extends CheckBoxProps {
	type: string;
	Icon: ComponentType<any>;
	IconChecked: ComponentType<any>;
}

export default function CheckBoxBase(props: InternalProps) {
	const { type, Icon, IconChecked, name, children, checked, disabled, onChange = NOOP } = props;
	return (
		<label className={Styles.container}>
			<input
				type={type}
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
			{ children && <span className={Styles.label}>{children}</span>}
		</label>
	);
}
