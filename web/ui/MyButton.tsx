import React, { MouseEvent, MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import Styles from "./MyButton.scss";

interface Props {
	title?: string;
	className?: string;
	disabled?: boolean;
	color?: string;
	busy?: boolean;
	onClick?: MouseEventHandler;
	children?: ReactNode;
}

function avoidMouseFocus(event: MouseEvent<HTMLElement>) {
	event.currentTarget.blur();
}

export default function MyButton(props: Props) {
	const { className, children, title, disabled, color, busy, onClick } = props;

	const classes = clsx(
		Styles.button,
		className,
		color,
		{ [Styles.busy]: busy },
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
