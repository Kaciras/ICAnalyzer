import React, { ChangeEvent, useRef, useState } from "react";
import clsx from "clsx";
import ImageIcon from "bootstrap-icons/icons/image.svg";
import { MyButton } from "../ui";
import Styles from "./SelectFilePanel.scss";
import { decode } from "../decode";

async function getFileFromUrl(url: string) {
	const blob = await (await fetch(url)).blob();
	const name = new URL(url).pathname.split("/").pop() || "image";
	return new File([blob], name);
}

/**
 * dragenter & dragleave can be triggered on crossing children element boundary,
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

interface Props {
	onCancel: () => void;
	onFileChange: (file: File, image: ImageData) => void;
}

export default function SelectFilePanel(props: Props) {
	const { onCancel, onFileChange } = props;

	const boundary = useBoundaryCounter();
	const textBox = useRef<HTMLInputElement>(null);
	const [downloading, setDownloading] = useState(false);
	const [error, setError] = useState("");

	function accept(file: File) {
		decode(file)
			.then(image => onFileChange(file, image[0]))
			.catch(() => setError("Can not decode file as image"));
	}

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		accept(event.currentTarget.files![0]);
	}

	async function downloadUrl() {
		const url = textBox.current!.value;
		if (!url) {
			return;
		}
		setDownloading(true);
		try {
			accept(await getFileFromUrl(url));
		} catch (e) {
			setError(e.message);
		} finally {
			setDownloading(false);
		}
	}

	function handleDrop(event: React.DragEvent) {
		event.preventDefault();
		boundary.reset();

		const { items } = event.dataTransfer;
		const file = items[0].getAsFile();

		if (file) {
			accept(file);
		} else {
			setError("The dropped item is not a file");
		}
	}

	return (
		<>
			<form className={Styles.form}>
				<label
					className={clsx(Styles.uploadFile, { [Styles.dragging]: boundary.isInArea })}
					tabIndex={0}
					onDragEnter={boundary.enter}
					onDragOver={e => e.preventDefault()}
					onDrop={handleDrop}
					onDragLeave={boundary.leave}
				>
					<div>
						<span className={Styles.icon}>
							<ImageIcon/>
						</span>
						<span className={Styles.text}>
							Drag & drop
						</span>
					</div>
					<div className={Styles.text}>
						Or select an image
					</div>
					<input
						className={Styles.fileInput}
						name="file"
						type="file"
						accept="image/*"
						onChange={handleFileChange}
					/>
				</label>
				<label>
					<span className={Styles.urlLabel}>
						Or image url
					</span>
					<input
						className={Styles.textInput}
						name="url"
						ref={textBox}
					/>
				</label>
				<div className={Styles.error}>{error}</div>
			</form>
			<div className="dialog-buttons">
				<MyButton color="second" onClick={onCancel}>Cancel</MyButton>
				<MyButton busy={downloading} onClick={downloadUrl}>Download Url</MyButton>
			</div>
		</>
	);
}
