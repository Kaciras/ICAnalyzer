import React, { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import { avoidMouseFocus } from "./common";
import Styles from "./IconButton.scss";

interface Props {
	title?: string;
	className?: string;
	disabled?: boolean;
	active?: boolean;
	href?: string;
	onClick?: MouseEventHandler;
	children?: ReactNode;
}

export default function IconButton(props: Props) {
	const { className, children, title, href, disabled, active, onClick } = props;

	const classes = clsx(
		Styles.iconButton,
		className,
		{ [Styles.active]: active },
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
			onMouseUp={avoidMouseFocus}
		>
			{children}
		</ButtonTag>
	);
}
