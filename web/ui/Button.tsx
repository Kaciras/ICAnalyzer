import { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Button.scss";

export interface ButtonProps {
	/**
	 * The basic style of the button, default is "button".
	 */
	type?: "button" | "text" | "outline";

	active?: boolean;
	disabled?: boolean;

	/**
	 * If set, will render an anchor with href attribute instead of a button.
	 */
	href?: string;

	autoFocus?: boolean;
	title?: string;
	className?: string;

	onClick?: MouseEventHandler;
	children?: ReactNode;
}

export default function Button(props: ButtonProps) {
	const {
		type = "button", href, active, autoFocus,
		title, className, disabled, onClick, children,
	} = props;

	const classes = clsx(
		styles[type],
		className,
		active && styles.active,
	);

	const ButtonTag = href ? "a" : "button";
	const htmlType = href ? undefined : "button";

	return (
		<ButtonTag
			className={classes}
			href={href}
			title={title}
			autoFocus={autoFocus}
			disabled={disabled}
			type={htmlType}
			onClick={onClick}
		>
			{children}
		</ButtonTag>
	);
}
