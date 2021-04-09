import { Dispatch, useState } from "react";
import { BatchEncodeAnalyzer, ConvertOutput, newWorker, ObjectKeyMap } from "../encode";
import type { InputImage, Result } from ".";
import SelectFileDialog from "./SelectFileDialog";
import ConfigDialog, { AnalyzeConfig } from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";
import { ENCODERS, ImageEncoder } from "../codecs";
import WorkerPool from "../WorkerPool";
import { WorkerApi } from "../worker";
import { ControlType, OptionsKeyPair } from "../form";

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

export type OutputMap = ObjectKeyMap<any, ConvertOutput>;

export default function CompressSession(props: CompressSessionProps) {
	const { open, onClose, onChange } = props;

	const [selectFile, setSelectFile] = useState(true);
	const [image, setImage] = useState<InputImage>();
	const [encoder, setEncoder] = useState<WorkerPool<WorkerApi>>();

	const progress = useProgress();
	const [error, setError] = useState<string>();

	function cancelSelectFile() {
		image ? setSelectFile(false) : onClose();
	}

	async function handleInputChange(image: InputImage) {
		setImage(image);
		setSelectFile(false);
	}

	async function handleStart(config: AnalyzeConfig) {
		if (!image) {
			throw new Error("File is null");
		}
		const { data } = image;
		const { encoders, measure } = config;

		let outputSize = 0;
		const queue: Array<[ImageEncoder, OptionsKeyPair[]]> = [];
		const controlsMap: Record<string, ControlType[]> = {};

		for (const enc of ENCODERS) {
			const { name, getOptionsList } = enc;
			const config = encoders[name];
			if (!config.enable) {
				continue;
			}
			const { controls, optionsList } = getOptionsList(config.state);
			controlsMap[name] = controls;
			queue.push([enc, optionsList]);
			outputSize += optionsList.length;
		}

		let calculations = 1;
		if (measure.butteraugli.enabled) calculations++;
		if (measure.PSNR) calculations++;
		if (measure.SSIM.enabled) calculations++;

		const warmup = measure.time ? measure.workerCount : 0;

		progress.reset(outputSize * calculations + warmup);

		const outputMap = new ObjectKeyMap<any, ConvertOutput>();
		const pool = new WorkerPool<WorkerApi>(newWorker, measure.workerCount);
		const worker = new BatchEncodeAnalyzer();

		setEncoder(pool);
		worker.onProgress = progress.increase;

		// noinspection ES6MissingAwait
		try {
			await pool.runOnEach(r => r.setImageToEncode(data));

			// Warmup workers to avoid disturbance of initialize time
			if (measure.time) {
				for (const [encoder, optionsList] of queue) {
					const { options } = optionsList[0];
					await pool.runOnEach(async r => encoder.encode(options, r).then(progress.increase));
				}
			}

			for (const [encoder, optionsList] of queue) {
				for (const { key, options } of optionsList) {

					// noinspection ES6MissingAwait
					pool.run(async r => {
						const info = await worker.encode(r, encoder, options);
						const metrics = await worker.measure(r, info.data, measure);

						const config = { encoder: encoder.name, key };
						outputMap.set(config, { ...info, metrics });
					});
				}
			}
			await pool.join();

			if (!pool.terminated) {
				setEncoder(undefined);
				onChange({ config: { controlsMap }, outputMap, original: image });
			}
		} catch (e) {
			// Some browsers will crash the page on OOM.
			console.error(e);
			setError(e.message);
		}

		pool.terminate();
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
				onChange={handleInputChange}
			/>
		);
	} else {
		return (
			<ConfigDialog
				image={image!}
				onStart={handleStart}
				onClose={onClose}
				onSelectFile={() => setSelectFile(true)}
			/>
		);
	}
}
