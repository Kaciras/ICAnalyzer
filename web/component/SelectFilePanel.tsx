import React, { ChangeEvent, Dispatch } from "react";
import ImageIcon from "bootstrap-icons/icons/image.svg";
import Styles from "./SelectFilePanel.scss";

interface Props {
	onFileChange: Dispatch<File | string>
}

export default function SelectFilePanel(props: Props) {

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		props.onFileChange(event.currentTarget.files![0]);
	}

	function handleUrlChange(event: ChangeEvent<HTMLInputElement>) {
		props.onFileChange(event.currentTarget.value);
	}

	return (
		<form className={Styles.form}>
			<label className={Styles.uploadFile} tabIndex={0}>
				<div className={Styles.icon}>
					<ImageIcon/>
				</div>
				<div className={Styles.text}>
					Drag & drop
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
				<span>Or image url</span>
				<input
					className="text-box"
					name="url"
					onChange={handleUrlChange}
				/>
			</label>
		</form>
	);
}
