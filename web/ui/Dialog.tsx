import { ReactNode, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { NOOP } from "../utils";
import styles from "./Dialog.scss";

interface DialogProps {
	className?: string;
	children: ReactNode;
	onClose?: () => void;
}

/**
 * Hide non-top-level dialogs.
 *
 * there is no :last-of-class selector so use js to implement.
 */
function hidePrevious() {
	const dialogs = document.body.querySelectorAll("." + styles.dimmer);
	const previous = dialogs[dialogs.length - 2];
	if (!previous) {
		return;
	}
	previous.classList.add(styles.hide);
	return () => previous.classList.remove(styles.hide);
}

export default function Dialog(props: DialogProps) {
	const { className, onClose = NOOP } = props;

	function handleKeyUp(event: KeyboardEvent) {
		if (event.key === "Escape") {
			onClose();
			event.stopImmediatePropagation();
		}
	}

	useEffect(() => {
		window.addEventListener("keyup", handleKeyUp);
		return () => window.removeEventListener("keyup", handleKeyUp);
	}, []);

	useLayoutEffect(hidePrevious, []);

	return createPortal(
		<div className={styles.dimmer}>
			<div className={clsx(className, styles.dialog)}>
				{props.children}
			</div>
		</div>,
		document.body,
	);
}
