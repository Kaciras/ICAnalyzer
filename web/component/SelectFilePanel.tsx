import React, { ChangeEvent, Dispatch, DragEvent, useRef, useState } from "react";
import clsx from "clsx";
import ImageIcon from "bootstrap-icons/icons/image.svg";
import Styles from "./SelectFilePanel.scss";

interface Props {
	onFileChange: Dispatch<File | string>
}

export default function SelectFilePanel(props: Props) {
	const enterCount = useRef(0);
	const [dragging, setDragging] = useState(false);

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		props.onFileChange(event.currentTarget.files![0]);
	}

	function handleUrlChange(event: ChangeEvent<HTMLInputElement>) {
		props.onFileChange(event.currentTarget.value);
	}

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
				<p>Or image url:</p>
				<input
					className={Styles.textInput}
					name="url"
					onChange={handleUrlChange}
				/>
			</label>
		</form>
	);
}
