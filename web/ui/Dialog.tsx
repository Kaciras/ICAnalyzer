import { ReactNode, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { NOOP } from "../utils";
import Styles from "./Dialog.scss";

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
	const dialogs = document.body.querySelectorAll("." + Styles.dimmer);
	const previous = dialogs[dialogs.length - 2];
	if (!previous) {
		return;
	}
	previous.classList.add(Styles.hide);
	return () => previous.classList.remove(Styles.hide);
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
		<div className={Styles.dimmer}>
			<div className={clsx(className, Styles.dialog)}>
				{props.children}
			</div>
		</div>,
		document.body,
	);
}
