import { noop } from "@kaciras/utilities/browser";
import { ChangeEvent, Dispatch, DragEvent, useRef, useState } from "react";
import clsx from "clsx";
import { TbPhoto } from "react-icons/tb";
import styles from "./FileDrop.scss";
import i18n from "../i18n.ts";

/**
 * Since dragenter & dragleave can be triggered on crossing children element boundary,
 * we count the number of entries and leaves to determine whether it is within the drag area.
 */
function useBoundaryCounter() {
	const [isInArea, setInArea] = useState(false);
	const counter = useRef(0);

	function enter() {
		setInArea(++counter.current > 0);
	}

	function leave() {
		setInArea(--counter.current > 0);
	}

	function reset() {
		counter.current = 0;
		setInArea(false);
	}

	return { isInArea, enter, leave, reset };
}

export interface FileDropProps {
	className?: string;
	accept?: string;
	multiple?: boolean;

	onSelectStart?: () => void;
	onChange: Dispatch<File[]>;
	onError: Dispatch<Error>;
}

export default function FileDrop(props: FileDropProps) {
	const { className, accept = "*/*", multiple, onSelectStart = noop, onChange, onError } = props;

	const boundary = useBoundaryCounter();
	const dragStarted = useRef(false);

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const { files } = event.currentTarget;
		if (files?.length) {
			onChange(Array.from(files));
		}
	}

	function handleDragEnter() {
		boundary.enter();

		function handleDragEnd() {
			document.removeEventListener("dragend", handleDragEnd);
			dragStarted.current = false;
		}

		if (!dragStarted.current) {
			dragStarted.current = true;
			onSelectStart();
			document.addEventListener("dragend", handleDragEnd);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		boundary.reset();

		const { items } = event.dataTransfer;

		const files = Array.from(items).map(e => e.getAsFile()).filter(Boolean);

		if (files.length === items.length) {
			onChange(files as File[]);
		} else {
			onError(new Error("Non-file item in the dropped list"));
		}
	}

	const classes = clsx(
		styles.fileDropBox,
		className,
		{ [styles.dragging]: boundary.isInArea },
	);

	return (
		<label
			className={classes}
			onDragEnter={handleDragEnter}
			onDragOver={e => e.preventDefault()}
			onDrop={handleDrop}
			onDragLeave={boundary.leave}
		>
			<span>
				<TbPhoto className={styles.icon}/>
				<span className={styles.text}>
					{i18n("DropAFile")}
				</span>
			</span>
			<span className={styles.text}>
				{i18n("OrSelectFile")}
			</span>
			<input
				className={styles.fileInput}
				name="file"
				type="file"
				accept={accept}
				multiple={multiple}
				onClick={onSelectStart}
				onChange={handleFileChange}
			/>
		</label>
	);
}
