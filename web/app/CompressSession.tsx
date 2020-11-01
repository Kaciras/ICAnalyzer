import React, { Dispatch, useState } from "react";
import { decode } from "../decode";
import { BatchEncoder, MeasureOptions } from "../encoding";
import { Result } from "./App";
import ConfigDialog from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";
import * as WebP from "../options/webp";
import SelectFileDialog from "./SelectFileDialog";

interface EncodingEvent {
	file: File;
	workerCount: number;
	encoder: string;
	optionsList: any[];
	measure: MeasureOptions;
}

interface Props {
	onChange: Dispatch<Result>;
	onClose: () => void;
}

export default function CompressSession(props: Props) {
	const [file, setFile] = useState<File>();
	const [image, setImage] = useState<ImageData>();
	const [selectFile, setSelectFile] = useState(true);

	const [encoder, setEncoder] = useState<BatchEncoder | null>(null);
	const [max, setMax] = useState(1);
	const [progress, setProgress] = useState(0);

	function cancelSelectFile() {
		if (!file) {
			props.onClose();
		}
		setSelectFile(false);
	}

	async function handleFileChange(newFile: File) {
		const image = await decode(newFile);
		setFile(newFile);
		setImage(image);
		setSelectFile(false);
	}

	async function handleStart(optionsList: any[], measure: MeasureOptions, workerCount: number) {
		if (!file) {
			throw new Error("File is null");
		}

		const encoding = WebP;
		const encoder = new BatchEncoder(workerCount, encoding);
		setEncoder(encoder);

		encoder.onProgress = (value, max) => {
			setMax(max);
			setProgress(value);
		};

		const data = await decode(file);
		const outputs = await encoder.encode(data, optionsList, measure);

		props.onChange({ original: { file, data }, codec: encoding, outputs });
	}

	function stop() {
		encoder!.stop();
		setEncoder(null);
	}

	if (encoder) {
		return <ProgressDialog value={progress} max={max} onCancel={stop}/>;
	} else if (selectFile) {
		return <SelectFileDialog onCancel={cancelSelectFile} onFileChange={handleFileChange}/>;
	} else {
		return <ConfigDialog
			image={image!}
			file={file!}
			onSelectFile={() => setSelectFile(true)}
			onClose={props.onClose}
			onStart={handleStart}
		/>;
	}
}
