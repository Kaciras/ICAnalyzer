import { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import { avoidMouseFocus } from "./common";
import styles from "./Button.scss";

interface Props {
	title?: string;
	className?: string;
	disabled?: boolean;
	color?: string;
	busy?: boolean;
	onClick?: MouseEventHandler;
	children?: ReactNode;
}

export default function Button(props: Props) {
	const { className, children, title, disabled, color, busy, onClick } = props;

	const classes = clsx(
		styles.button,
		className,
		color,
		{ [styles.busy]: busy },
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
