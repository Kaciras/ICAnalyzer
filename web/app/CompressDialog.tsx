import React, { useState } from "react";
import { decode } from "../decode";
import { BatchEncoder, ConvertOutput, MeasureOptions } from "../encoding";
import ConfigPanel from "./ConfigPanel";
import ProgressPanel from "./ProgressPanel";
import * as WebP from "../options/webp";
import SelectFilePanel from "./SelectFilePanel";
import { Dialog } from "../ui";

interface EncodingEvent {
	file: File;
	workerCount: number;
	encoder: string;
	optionsList: any[];
	measure: MeasureOptions;
}

interface Props {
	onChange: (file: File, results: ConvertOutput[]) => void;
	onClose: () => void;
}

export default function CompressDialog(props: Props) {
	const [file, setFile] = useState<File>();
	const [image, setImage] = useState<ImageData>();
	const [selectFile, setSelectFile] = useState(true);

	const [encoder, setEncoder] = useState<BatchEncoder<unknown>>();
	const [max, setMax] = useState(1);
	const [progress, setProgress] = useState(0);

	function cancelSelectFile() {
		if (!file) {
			props.onClose();
		}
		setSelectFile(false);
	}

	async function handleFileChange(newFile: File) {
		const [image] = await decode(newFile);
		setFile(newFile);
		setImage(image);
		setSelectFile(false);
	}

	async function handleStart(optionsList: any[], measure: MeasureOptions, workerCount: number) {
		if (!file) {
			throw new Error("File is null");
		}

		const encoder = new BatchEncoder(workerCount, WebP);
		encoder.onProgress = setProgress;

		setEncoder(encoder);
		setMax(optionsList.length);
		setProgress(0);

		const [image] = await decode(file);
		const outputs = await encoder.encode(image, optionsList, measure);

		props.onChange(file, outputs);
	}

	function stop() {
		setEncoder(undefined);
		encoder!.stop();
	}

	let panel;

	if (encoder) {
		panel = <ProgressPanel value={progress} max={max} onCancel={stop}/>;
	} else if (selectFile) {
		panel = <SelectFilePanel onCancel={cancelSelectFile} onFileChange={handleFileChange}/>;
	} else {
		panel = <ConfigPanel
			image={image!}
			file={file!}
			onSelectFile={() => setSelectFile(true)}
			onClose={props.onClose}
			onStart={handleStart}
		/>;
	}

	return <Dialog onClose={props.onClose}>{panel}</Dialog>;
}
