import { Dispatch, useState } from "react";
import { AnalyzeResult, initialize, newWorker } from "../analyzing";
import { ENCODERS } from "../codecs";
import WorkerPool from "../WorkerPool";
import { WorkerApi } from "../worker";
import { OptionsKey } from "../form";
import { getMetricsMeta, measure } from "../measurement";
import { ObjectKeyMap, useProgress } from "../utils";
import { AnalyzeContext, ControlsMap, InputImage, MetricMeta } from ".";
import SelectFileDialog from "./SelectFileDialog";
import ConfigDialog, { AnalyzeConfig } from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";
import { decode } from "../decode";

interface CompressSessionProps {
	isOpen: boolean;
	onChange: Dispatch<AnalyzeContext>;
	onClose: () => void;
}

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
		const { file } = input;
		const { encoding, measurement } = config;

		const pool = new WorkerPool<WorkerApi>(newWorker, measurement.workerCount);
		await initialize(pool, input);

		const controlsMap: ControlsMap = {};
		const outputMap = new ObjectKeyMap<OptionsKey, AnalyzeResult>();
		const tasks: Array<Promise<void>> = [];
		const aTasks : Array<Promise<any>> = [];

		for (const encoder of ENCODERS) {
			const { name } = encoder;
			const { enable, state } = encoding[name];
			if (!enable) {
				continue;
			}
			const filename = file.name.replace(/.[^.]*$/, `.${encoder.extension}`);
			controlsMap[name] = encoder.getControls(state);
			const optionsList = encoder.getOptionsList(state);

			// Warmup workers to reduce disturbance of initialize time
			// if (measurement.encodeTime.enabled) {
			// 	const { options } = optionsList[0];
			// 	await pool.runOnEach(r => encoder.encode(options, r));
			// }

			for (const { key, options } of optionsList) {
				tasks.push(pool.run(async worker => {
					const { buffer, time } = await encoder.encode(options, worker);
					const file = new File([buffer], filename, { type: encoder.mimeType });
					progress.increase();

					const output: AnalyzeResult = {
						file,
						data: await decode(file, worker),
						metrics: { time },
					};
					aTasks.push(measure(measurement, pool, output, progress.increase));
					outputMap.set({ codec: encoder.name, key }, output);
				}));
			}
		}

		const { calculations, metricsMeta } = getMetricsMeta(measurement);
		let taskCount = tasks.length;
		taskCount *= (1 + calculations);

		const seriesMeta: MetricMeta[] = [];
		seriesMeta.push(...metricsMeta);

		if (measurement.encodeTime.enabled) {
			seriesMeta.push({ key: "time", name: "Encode Time (s)" });
			taskCount += measurement.workerCount;
		}

		progress.reset(taskCount);
		setEncoder(pool);
		try {
			await Promise.all(tasks);
			await Promise.all(aTasks);

			if (!pool.terminated) {
				setEncoder(undefined);
				onChange({ input, controlsMap, seriesMeta, outputMap });
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
