import { Dispatch, useState } from "react";
import { BatchEncodeAnalyzer, ConvertOutput, getMetricsMeta, measureFor, newWorker, ObjectKeyMap } from "../encode";
import { ENCODERS, ImageEncoder } from "../codecs";
import WorkerPool from "../WorkerPool";
import { WorkerApi } from "../worker";
import { ControlType, OptionsKeyPair } from "../form";
import { useProgress } from "../utils";
import type { InputImage, Result } from ".";
import SelectFileDialog from "./SelectFileDialog";
import ConfigDialog, { AnalyzeConfig } from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";

interface CompressSessionProps {
	isOpen: boolean;
	onChange: Dispatch<Result>;
	onClose: () => void;
}

export type OutputMap = ObjectKeyMap<any, ConvertOutput>;

export default function CompressSession(props: CompressSessionProps) {
	const { isOpen, onClose, onChange } = props;

	const [selectFile, setSelectFile] = useState(true);
	const [input, setInput] = useState<InputImage>();
	const [encoder, setEncoder] = useState<WorkerPool<WorkerApi>>();

	const progress = useProgress();
	const [error, setError] = useState<string>();

	function cancelSelectFile() {
		input ? setSelectFile(false) : onClose();
	}

	async function handleInputChange(image: InputImage) {
		setInput(image);
		setSelectFile(false);
	}

	async function handleStart(config: AnalyzeConfig) {
		if (!input) {
			throw new Error("File is null");
		}
		const { file, raw } = input;
		const { encoders, measure } = config;

		let taskCount = 0;
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
			taskCount += optionsList.length;
		}

		const seriesMeta = [{ key: "ratio", name: "Compression Ratio %" }];

		const { calculations, metricsMeta } = getMetricsMeta(measure);
		taskCount *= (1 + calculations);
		seriesMeta.push(...metricsMeta);

		if (measure.time) {
			seriesMeta.push({ key: "time", name: "Encode Time (s)" });
			taskCount += measure.workerCount;
		}

		const outputMap = new ObjectKeyMap<any, ConvertOutput>();
		const pool = new WorkerPool<WorkerApi>(newWorker, measure.workerCount);
		const worker = new BatchEncodeAnalyzer();
		const measureFn = measureFor(pool, measure, progress.increase);

		progress.reset(taskCount);
		setEncoder(pool);
		worker.onProgress = progress.increase;

		// noinspection ES6MissingAwait
		try {
			await pool.runOnEach(r => r.setImageToEncode(raw));

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
						const { buffer, data, time } = await worker.encode(r, encoder, options);
						const ratio = buffer.byteLength / file.size * 100;
						const output: ConvertOutput = {
							buffer,
							data,
							metrics: { time, ratio },
						};
						measureFn(output);
						outputMap.set({ encoder: encoder.name, key }, output);
					});
				}
			}
			await pool.join();

			if (!pool.terminated) {
				setEncoder(undefined);
				onChange({ controlsMap, seriesMeta, outputMap, input });
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

	if (!isOpen) {
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
				image={input!}
				onStart={handleStart}
				onClose={onClose}
				onSelectFile={() => setSelectFile(true)}
			/>
		);
	}
}
