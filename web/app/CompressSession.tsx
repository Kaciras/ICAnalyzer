import { Dispatch, useState } from "react";
import { decode } from "../decode";
import { BatchEncodeAnalyzer, ConvertOutput } from "../encode";
import type { Result } from ".";
import SelectFileDialog from "./SelectFileDialog";
import ConfigDialog, { AnalyzeConfig } from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";
import { ENCODERS, ImageEncoder } from "../codecs";

interface Props {
	open: boolean;
	onChange: Dispatch<Result>;
	onClose: () => void;
}

type OptKey = string | number;

export type OptionsToResult = Record<OptKey, ConvertOutput>;
export type EncoderNameToOptions = Record<string, OptionsToResult>;

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
		const { encoders, measure } = config;
		const image = await decode(file);

		let outputSizePerImage = 0;
		const queue: [ImageEncoder, any[]][] = [];

		for (const enc of ENCODERS) {
			const { name, getOptionsList } = enc;
			const config = encoders[name];
			if (!config.enable) {
				continue;
			}
			const optList = getOptionsList(config.state);
			queue.push([enc, optList]);
			outputSizePerImage += optList.length;
		}

		let calculations = 1;
		if (measure.butteraugli.enabled) calculations++;
		if (measure.SSIM.enabled) calculations++;
		if (measure.PSNR) calculations++;

		const warmup = measure.time ? measure.workerCount : 0;

		setMax(outputSizePerImage * calculations + warmup);
		setProgress(0);

		const eMap: EncoderNameToOptions = {};

		for (const [encoder, optionsList] of queue) {
			const oMap: OptionsToResult = {};
			eMap[encoder.name] = oMap;

			const worker = new BatchEncodeAnalyzer(image, {
				encoder,
				optionsList,
				measure,
			});
			worker.onProgress = () => setProgress(p => p + 1);

			setEncoder(worker);
			const outputs = await worker.encode();
			worker.terminate();
			setEncoder(null);

			for (let i = 0; i < optionsList.length; i++) {
				oMap[JSON.stringify(optionsList[i])] = outputs[i];
			}
		}

		props.onChange({
			config,
			map: eMap,
			original: { file, data: image! },
		});
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
