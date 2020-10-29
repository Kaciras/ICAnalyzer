import React, { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import Styles from "../app/CompressDialog.scss";

interface Props {
	children: ReactNode;
	onClose(): void;
}

export default function Dialog(props: Props) {

	function handleKeyUp(event: KeyboardEvent) {
		if (event.key === "Escape") {
			props.onClose();
			event.stopImmediatePropagation();
		}
	}

	useEffect(() => {
		window.addEventListener("keyup", handleKeyUp);
		return () => window.removeEventListener("keyup", handleKeyUp);
	}, []);

	return createPortal(
		<div className={Styles.dimmer}>
			<div className={Styles.dialog}>{props.children}</div>
		</div>,
		document.body,
	);
}
