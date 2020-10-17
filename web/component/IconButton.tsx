import React, { MouseEvent, MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import Styles from "./IconButton.scss";

interface Props {
	title?: string;
	className?: string;
	disabled?: boolean;
	active?: boolean;
	onClick?: MouseEventHandler;
	children?: ReactNode;
}

function avoidMouseFocus(event: MouseEvent<HTMLElement>) {
	event.currentTarget.blur();
}

export default function IconButton(props: Props) {
	const { className, children, title, disabled, active, onClick } = props;

	const classes = clsx(
		Styles.iconButton,
		className,
		{ [Styles.active]: active },
	);

	return (
		<button
			className={classes}
			title={title}
			disabled={disabled}
			type="button"
			onClick={onClick}
			onMouseUp={avoidMouseFocus}
		>
			{children}
		</button>
	);
}
