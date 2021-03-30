import { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import styles from "./ControlField.scss";

export interface ControlFieldProps {
	active: boolean;
	className?: string;

	onFocus: MouseEventHandler;
	children: ReactNode;
}

export default function ControlField(props: ControlFieldProps) {
	const { active, className, onFocus, children } = props;

	const clazz = clsx(
		styles.container,
		className,
		{ [styles.active]: active },
	);

	return <div className={clazz} onClick={onFocus}>{children}</div>;
}
