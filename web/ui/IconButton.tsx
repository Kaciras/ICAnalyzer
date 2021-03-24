import { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import styles from "./IconButton.scss";

export interface IconButtonProps {
	title?: string;
	className?: string;
	disabled?: boolean;
	active?: boolean;
	href?: string;
	onClick?: MouseEventHandler;
	children?: ReactNode;
}

export default function IconButton(props: IconButtonProps) {
	const { className, children, title, href, disabled, active, onClick } = props;

	const classes = clsx(
		styles.iconButton,
		className,
		{ [styles.active]: active },
	);

	const ButtonTag = href ? "a" : "button";

	return (
		<ButtonTag
			className={classes}
			title={title}
			disabled={disabled}
			href={href}
			type="button"
			onClick={onClick}
		>
			{children}
		</ButtonTag>
	);
}
