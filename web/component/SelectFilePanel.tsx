import React, { ChangeEvent, Dispatch } from "react";
import imageIcon from "bootstrap-icons/icons/image.svg";
import Styles from "./SelectFilePanel.scss";

interface SFProps {
	setFile: Dispatch<File>
}

export default function SelectFilePanel(props: SFProps) {

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		props.setFile(event.currentTarget.files![0]);
	}

	return (
		<form className={Styles.form}>
			<label className={Styles.uploadFile} tabIndex={0}>
				<div
					className={Styles.icon}
					dangerouslySetInnerHTML={{__html: imageIcon}}
				/>
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
					onChange={handleChange}
				/>
			</label>
			<label>
				<span>Or image url</span>
				<input className="text-box" name="url" onChange={handleChange}/>
			</label>
		</form>
	);
}
