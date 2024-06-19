import { ReactNode, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import styles from "./Dialog.scss";

interface DialogProps {
	className?: string;
	name?: string;
	children: ReactNode;
	onClose?: () => void;
}

/**
 * Hide non-top-level dialogs.
 *
 * there is no :last-of-class selector so use JS to implement.
 */
function hidePrevious() {
	const dialogs = document.body.querySelectorAll("." + styles.dimmer);
	const previous = dialogs[dialogs.length - 2];
	if (!previous) {
		return;
	}
	previous.classList.add("hidden");
	return () => previous.classList.remove("hidden");
}

export default function Dialog(props: DialogProps) {
	const { className, name, onClose, children } = props;

	function handleKeyUp(event: KeyboardEvent) {
		if (event.key === "Escape") {
			onClose?.();
			event.stopImmediatePropagation();
		}
	}

	function listenKeyboardClose() {
		window.addEventListener("keydown", handleKeyUp);
		return () => window.removeEventListener("keydown", handleKeyUp);
	}

	useEffect(listenKeyboardClose, [onClose]);
	useLayoutEffect(hidePrevious, []);

	const reactNode = (
		<div className={styles.dimmer}>
			<div
				role="dialog"
				aria-label={name}
				className={clsx(styles.dialog, className)}
			>
				{children}
			</div>
		</div>
	);

	return createPortal(reactNode, document.body);
}
