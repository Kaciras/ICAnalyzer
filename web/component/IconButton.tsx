import React, { MouseEventHandler } from "react";
import Styles from "./IconButton.scss";

interface Props {
	title?: string;
	icon: string;
	disabled?: boolean;
	onClick?: MouseEventHandler;
}

export default function IconButton(props: Props) {
	return (
		<button
			className={Styles.iconButton}
			title={props.title}
			disabled={props.disabled}
			onClick={props.onClick}
			dangerouslySetInnerHTML={{ __html: props.icon }}
		/>
	);
}
