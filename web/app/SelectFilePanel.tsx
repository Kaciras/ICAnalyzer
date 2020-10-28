import React, { ChangeEvent, Dispatch, DragEvent, useRef, useState } from "react";
import clsx from "clsx";
import ImageIcon from "bootstrap-icons/icons/image.svg";
import { MyButton } from "../ui";
import Styles from "./SelectFilePanel.scss";

async function getFileFromUrl(url: string) {
	const blob = await (await fetch(url)).blob();
	const name = new URL(url).pathname.split("/").pop()!;
	return new File([blob], name);
}

interface Props {
	onCancel: () => void;
	onFileChange: Dispatch<File>;
}

export default function SelectFilePanel(props: Props) {
	const { onCancel, onFileChange } = props;

	const [downloading, setDownloading] = useState(false);
	const [error, setError] = useState("");

	const enterCount = useRef(0);
	const [dragging, setDragging] = useState(false);

	const textBox = useRef<HTMLInputElement>(null);

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		onFileChange(event.currentTarget.files![0]);
	}

	async function downloadUrl() {
		const url = textBox.current!.value;
		if (!url) {
			return;
		}
		setDownloading(true);
		try {
			onFileChange(await getFileFromUrl(url));
		} catch (e) {
			setError(e.message);
		} finally {
			setDownloading(false);
		}
	}

	// dragenter & dragleave can be triggered on crossing children element boundary,
	//
	function handleDrag(isEnter: boolean) {
		if (isEnter) {
			enterCount.current++;
		} else {
			enterCount.current--;
		}
		const active = enterCount.current > 0;
		if (dragging !== active) {
			setDragging(active);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const { items } = event.dataTransfer;
		const file = items[0].getAsFile();
		file && props.onFileChange(file);
	}

	return (
		<form className={Styles.form}>
			<label
				className={clsx(Styles.uploadFile, { [Styles.dragging]: dragging })}
				tabIndex={0}
				onDragEnter={() => handleDrag(true)}
				onDragOver={e => e.preventDefault()}
				onDrop={handleDrop}
				onDragLeave={() => handleDrag(false)}
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
			<div className="dialog-buttons">
				<MyButton onClick={onCancel}>Cancel</MyButton>
				<MyButton onClick={downloadUrl}>Download Url</MyButton>
			</div>
		</form>
	);
}
