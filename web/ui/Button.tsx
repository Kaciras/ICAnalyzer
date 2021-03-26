import { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Button.scss";

export interface ButtonProps {
	type?: "button" | "text" | "outline";
	href?: string;
	active?: boolean;

	title?: string;
	className?: string;
	disabled?: boolean;

	onClick?: MouseEventHandler;
	children?: ReactNode;
}

export default function Button(props: ButtonProps) {
	const { type = "button", href, active, title, className, disabled, onClick, children } = props;

	const classes = clsx(
		styles[type],
		className,
		{ [styles.active]: active },
	);

	const ButtonTag = href ? "a" : "button";
	const htmlType = href ? undefined : "button";

	return (
		<ButtonTag
			className={classes}
			href={href}
			title={title}
			disabled={disabled}
			type={htmlType}
			onClick={onClick}
		>
			{children}
		</ButtonTag>
	);
}
