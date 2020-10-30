import React, { useState } from "react";
import { decode } from "../decode";
import { BatchEncoder, ConvertOutput, MeasureOptions } from "../encoding";
import ConfigDialog from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";
import * as WebP from "../options/webp";
import SelectFileDialog from "./SelectFileDialog";
import { InputImage } from "./App";
import { ImageEncoder } from "../options";

interface EncodingEvent {
	file: File;
	workerCount: number;
	encoder: string;
	optionsList: any[];
	measure: MeasureOptions;
}

interface Props {
	onChange: (file: InputImage, encoder: ImageEncoder, results: ConvertOutput[]) => void;
	onClose: () => void;
}

export default function CompressSession(props: Props) {
	const [file, setFile] = useState<File>();
	const [image, setImage] = useState<ImageData>();
	const [selectFile, setSelectFile] = useState(true);

	const [encoder, setEncoder] = useState<BatchEncoder<unknown> | null>({} as any);
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

		const encoder = new BatchEncoder(workerCount, WebP);
		encoder.onProgress = setProgress;

		setEncoder(encoder);
		setMax(optionsList.length);
		setProgress(0);

		const data = await decode(file);
		const outputs = await encoder.encode(data, optionsList, measure);

		props.onChange({ file, data }, WebP, outputs);
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
