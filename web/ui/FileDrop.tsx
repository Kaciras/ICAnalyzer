import { ChangeEvent, Dispatch, useRef, useState } from "react";
import clsx from "clsx";
import ImageIcon from "bootstrap-icons/icons/image.svg";
import { NOOP } from "../utils";
import styles from "./FileDrop.scss";

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
	onStart?: () => void;
	onChange: Dispatch<File>;
	onError: Dispatch<string>;
}

export default function FileDrop(props: FileDropProps) {
	const { className, accept = "*/*", onStart = NOOP, onChange, onError } = props;

	const boundary = useBoundaryCounter();
	const dragStarted = useRef(false);

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const { files } = event.currentTarget;
		if (files?.length) {
			onChange(files[0]);
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
			onStart();
			document.addEventListener("dragend", handleDragEnd);
		}
	}

	function handleDrop(event: React.DragEvent) {
		event.preventDefault();
		boundary.reset();

		const { items } = event.dataTransfer;
		const file = items[0]?.getAsFile();

		if (file) {
			onChange(file);
		} else {
			onError("The dropped item is not a file");
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
			<div>
				<ImageIcon className={styles.icon}/>
				<span className={styles.text}>
					Drag & drop
				</span>
			</div>
			<div className={styles.text}>
				Or select an image
			</div>
			<input
				className={styles.fileInput}
				name="file"
				type="file"
				accept={accept}
				onClick={onStart}
				onChange={handleFileChange}
			/>
		</label>
	);
}
