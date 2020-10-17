import React, { MouseEvent, MouseEventHandler } from "react";
import clsx from "clsx";
import Styles from "./IconButton.scss";

interface Props {
	title?: string;
	icon: string;
	disabled?: boolean;
	active?: boolean;
	onClick?: MouseEventHandler;
}

function avoidMouseFocus(event: MouseEvent<HTMLElement>) {
	event.currentTarget.blur();
}

export default function IconButton(props: Props) {
	const { icon, title, disabled, active, onClick } = props;
	return (
		<button
			className={clsx(Styles.iconButton, { [Styles.active]: active })}
			title={title}
			disabled={disabled}
			type="button"
			onClick={onClick}
			onMouseUp={avoidMouseFocus}
			dangerouslySetInnerHTML={{ __html: icon }}
		/>
	);
}
