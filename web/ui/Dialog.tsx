import { ReactNode, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { NOOP } from "../utils";
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

function preventScroll() {
	const { style } = document.body;

	const old = {
		maxWidth: style.maxWidth,
		maxHeight: style.maxHeight,
		overflow: style.overflow,
	};

	style.maxWidth = "100vw";
	style.maxHeight = "100vh";
	style.overflow = "hidden";

	return () => void Object.assign(style, old);
}

export default function Dialog(props: DialogProps) {
	const { className, name, onClose = NOOP, children } = props;

	function listenKeyboardClose() {
		function handleKeyUp(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onClose();
				event.stopImmediatePropagation();
			}
		}

		window.addEventListener("keyup", handleKeyUp);
		return () => window.removeEventListener("keyup", handleKeyUp);
	}

	useEffect(listenKeyboardClose, [onClose]);
	useLayoutEffect(hidePrevious, []);
	useLayoutEffect(preventScroll, []);

	return createPortal(
		<div className={styles.dimmer}>
			<div
				role="dialog"
				aria-label={name}
				className={clsx(className, styles.dialog)}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}
