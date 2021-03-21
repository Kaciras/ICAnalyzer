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
	const { open, onClose, onChange } = props;

	const [selectFile, setSelectFile] = useState(true);
	const [file, setFile] = useState<File>();
	const [image, setImage] = useState<ImageData>();

	const [encoder, setEncoder] = useState<BatchEncodeAnalyzer>();

	const [error, setError] = useState<string>();
	const [max, setMax] = useState(1);
	const [progress, setProgress] = useState(0);

	function cancelSelectFile() {
		if (file) {
			setSelectFile(false);
		} else {
			onClose();
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
		let worker: BatchEncodeAnalyzer | null = null;
		try {
			for (const [encoder, optionsList] of queue) {
				const oMap: OptionsToResult = {};
				eMap[encoder.name] = oMap;

				worker = new BatchEncodeAnalyzer(image, {
					encoder,
					optionsList,
					measure,
				});
				worker.onProgress = () => setProgress(p => p + 1);

				setEncoder(worker);
				const outputs = await worker.encode();
				worker.terminate();
				setEncoder(undefined);

				for (let i = 0; i < optionsList.length; i++) {
					oMap[JSON.stringify(optionsList[i])] = outputs[i];
				}

				onChange({ config, map: eMap, original: { file, data: image! } });
			}
		} catch (e) {
			// Some browsers will crash the page on OOM.
			worker?.terminate();
			console.error(e);
			setError(e.message);
		}
	}

	function stop() {
		encoder!.terminate();
		setEncoder(undefined);
	}

	if (!open) {
		return null;
	} else if (encoder) {
		return (
			<ProgressDialog
				error={error}
				value={progress}
				max={max}
				onCancel={stop}
			/>
		);
	} else if (selectFile) {
		return (
			<SelectFileDialog
				onCancel={cancelSelectFile}
				onFileChange={handleFileChange}
			/>
		);
	} else {
		return (
			<ConfigDialog
				image={image!}
				file={file!}
				onStart={handleStart}
				onClose={onClose}
				onSelectFile={() => setSelectFile(true)}
			/>
		);
	}
}
