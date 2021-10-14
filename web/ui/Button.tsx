import { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Button.scss";

export interface ButtonProps {

	/**
	 * The basic style of the button, default is "button".
	 *
	 * @default "button"
	 */
	type?: "button" | "text" | "outline";

	/**
	 * Apply the active style to the button?
	 *
	 * @default false
	 */
	active?: boolean;

	/**
	 * If set, will render an anchor element with href attribute.
	 */
	href?: string;

	autoFocus?: boolean;
	title?: string;
	className?: string;
	disabled?: boolean;

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
