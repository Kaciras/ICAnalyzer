import React, { Dispatch, useState } from "react";
import { decode } from "../decode";
import { BatchEncoder, MeasureOptions } from "../encode";
import { Result } from "./App";
import ConfigDialog from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";
import * as WebP from "../codecs/webp";
import SelectFileDialog from "./SelectFileDialog";

interface EncodingEvent {
	file: File;
	workerCount: number;
	encoder: string;
	optionsList: any[];
	measure: MeasureOptions;
}

interface Props {
	open: boolean;
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
		const image = await decode(file);

		const encoder = new BatchEncoder(workerCount, {
			encoder: encoding,
			image,
			optionsList,
			measure,
		});
		setEncoder(encoder);
		setMax(encoder.progressMax);
		encoder.onProgress = setProgress;

		const outputs = await encoder.encode();
		encoder.terminate();
		setEncoder(null);

		props.onChange({ original: { file, data: image }, codec: encoding, outputs });
	}

	function stop() {
		encoder!.terminate();
		setEncoder(null);
	}

	if (!props.open) {
		return null;
	} else if (encoder) {
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
