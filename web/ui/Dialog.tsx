import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import styles from "./Dialog.scss";

interface DialogProps {
	className?: string;
	name?: string;
	children: ReactNode;
	onClose?: () => void;
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
