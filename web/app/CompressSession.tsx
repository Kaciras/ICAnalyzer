import { Dispatch, useState } from "react";
import { decode } from "../decode";
import { AnalyzeConfig, BatchEncodeAnalyzer } from "../encode";
import { Result } from "./App";
import SelectFileDialog from "./SelectFileDialog";
import ConfigDialog from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";

interface Props {
	open: boolean;
	onChange: Dispatch<Result>;
	onClose: () => void;
}

export default function CompressSession(props: Props) {
	const [file, setFile] = useState<File>();
	const [image, setImage] = useState<ImageData>();
	const [selectFile, setSelectFile] = useState(true);

	const [encoder, setEncoder] = useState<BatchEncodeAnalyzer | null>(null);
	const [max, setMax] = useState(1);
	const [progress, setProgress] = useState(0);

	function cancelSelectFile() {
		if (file) {
			setSelectFile(false);
		} else {
			props.onClose();
		}
	}

	async function handleFileChange(newFile: File) {
		const image = await decode(newFile);
		setFile(newFile);
		setImage(image);
		setSelectFile(false);
	}

	async function handleStart(config: AnalyzeConfig) {
		if (!file) {
			throw new Error("File is null");
		}
		const image = await decode(file);
		const encoder = new BatchEncoder(image, config);

		setMax(encoder.progressMax);
		setProgress(0);
		encoder.onProgress = setProgress;

		setEncoder(encoder);
		const outputs = await encoder.encode();
		encoder.terminate();
		setEncoder(null);

		props.onChange({ original: { file, data: image }, codec: config.encoder, outputs });
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
