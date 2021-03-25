import { Dispatch, useState } from "react";
import { decode } from "../decode";
import { BatchEncodeAnalyzer, ConvertOutput } from "../encode";
import type { Result } from ".";
import SelectFileDialog from "./SelectFileDialog";
import ConfigDialog, { AnalyzeConfig } from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";
import { ENCODERS, ImageEncoder } from "../codecs";

function useProgress(initialMax = 1) {
	const [max, setMax] = useState(initialMax);
	const [value, setValue] = useState(0);

	function reset(value: number) {
		setValue(0);
		setMax(value);
	}

	function increase() {
		setValue(v => v + 1);
	}

	return { value, max, increase, reset };
}

interface CompressSessionProps {
	open: boolean;
	onChange: Dispatch<Result>;
	onClose: () => void;
}

export type OptionsToResult = Record<string, ConvertOutput>;
export type EncoderNameToOptions = Record<string, OptionsToResult>;

export default function CompressSession(props: CompressSessionProps) {
	const { open, onClose, onChange } = props;

	const [selectFile, setSelectFile] = useState(true);

	const [file, setFile] = useState<File>();
	const [image, setImage] = useState<ImageData>();

	const [encoder, setEncoder] = useState<BatchEncodeAnalyzer>();

	const progress = useProgress();
	const [error, setError] = useState<string>();

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

		let outputSize = 0;
		const queue: [ImageEncoder, any[]][] = [];

		for (const enc of ENCODERS) {
			const { name, getOptionsList } = enc;
			const config = encoders[name];
			if (!config.enable) {
				continue;
			}
			const optList = getOptionsList(config.state);
			queue.push([enc, optList]);
			outputSize += optList.length;
		}

		let calculations = 1;
		if (measure.butteraugli.enabled) calculations++;
		if (measure.PSNR) calculations++;
		if (measure.SSIM.enabled) calculations++;

		const warmup = measure.time ? measure.workerCount : 0;

		progress.reset(outputSize * calculations + warmup);

		const eMap: EncoderNameToOptions = {};
		let worker: BatchEncodeAnalyzer | null = null;
		try {
			worker = new BatchEncodeAnalyzer(image, measure);
			worker.onProgress = progress.increase;

			setEncoder(worker);
			await worker.initialize();

			// Warmup workers to avoid disturbance of initialize time
			if (measure.time) {
				for (const [encoder, optionsList] of queue) {
					await worker.pool.runOnEach(async remote => {
						return encoder.encode(remote, optionsList[0]).then(progress.increase);
					});
				}
			}

			for (const [encoder, optionsList] of queue) {
				const oMap: OptionsToResult = {};
				eMap[encoder.name] = oMap;

				for (let i = 0; i < optionsList.length; i++) {
					const options = optionsList[i];
					worker.encode(encoder, options).then(o => oMap[JSON.stringify(options)] = o);
				}
			}
			await worker.pool.join();
			worker.terminate();
			setEncoder(undefined);
		} catch (e) {
			// Some browsers will crash the page on OOM.
			worker?.terminate();
			console.error(e);
			setError(e.message);
		}

		onChange({ config, map: eMap, original: { file, data: image! } });
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
				value={progress.value}
				max={progress.max}
				error={error}
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
