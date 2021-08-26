import { Dispatch, useState } from "react";
import { Analyzer, AnalyzeResult, newWorker, ObjectKeyMap } from "../analyzing";
import { ENCODERS, ImageEncoder } from "../codecs";
import WorkerPool from "../WorkerPool";
import { WorkerApi } from "../worker";
import { OptionsKey, OptionsKeyPair } from "../form";
import { useProgress } from "../utils";
import { AnalyzeContext, ControlsMap, InputImage, MetricMeta } from ".";
import SelectFileDialog from "./SelectFileDialog";
import ConfigDialog, { AnalyzeConfig } from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";
import { EncodingOptions } from "./EncoderPanel";

interface EncodeTask {
	encoder: ImageEncoder;
	optionsList: OptionsKeyPair[];
}

function getTasks(encoding: EncodingOptions) {
	const controlsMap: ControlsMap = {};
	const taskQueue: EncodeTask[] = [];

	for (const encoder of ENCODERS) {
		const { name } = encoder;
		const { enable, state } = encoding[name];
		if (!enable) {
			continue;
		}
		controlsMap[name] = encoder.getControls(state);
		const optionsList = encoder.getOptionsList(state);
		taskQueue.push({ encoder, optionsList });
	}

	return { controlsMap, taskQueue };
}

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
		const { encoding, measure } = config;

		const { controlsMap, taskQueue } = getTasks(encoding);

		const outputMap = new ObjectKeyMap<OptionsKey, AnalyzeResult>();
		const pool = new WorkerPool<WorkerApi>(newWorker, measure.workerCount);
		const analyzer = new Analyzer(pool, measure);

		const seriesMeta: MetricMeta[] = [
			{ key: "ratio", name: "Compression Ratio %" },
		];

		const { calculations, metricsMeta } = analyzer.getMetricsMeta();
		let taskCount = taskQueue.reduce((s, c) => s + c.optionsList.length, 0);
		taskCount *= (1 + calculations);
		seriesMeta.push(...metricsMeta);

		if (measure.time) {
			seriesMeta.push({ key: "time", name: "Encode Time (s)" });
			taskCount += measure.workerCount;
		}

		progress.reset(taskCount);
		setEncoder(pool);
		analyzer.onProgress = progress.increase;

		try {
			await analyzer.setOriginalImage(input);

			// Warmup workers to avoid disturbance of initialize time
			if (measure.time) {
				for (const { encoder, optionsList } of taskQueue) {
					const { options } = optionsList[0];
					await pool.runOnEach(r => encoder.encode(options, r).then(progress.increase));
				}
			}

			for (const { encoder, optionsList } of taskQueue) {
				const filename = file.name.replace(/.[^.]*$/, `.${encoder.extension}`);

				for (const { key, options } of optionsList) {

					// noinspection ES6MissingAwait
					pool.run(async r => {
						const { buffer, data, time } = await analyzer.encode(r, encoder, options);
						const ratio = buffer.byteLength / file.size * 100;

						const output: AnalyzeResult = {
							file: new File([buffer], filename, { type: encoder.mimeType }),
							data,
							metrics: { time, ratio },
						};
						analyzer.measure(output);
						outputMap.set({ codec: encoder.name, key }, output);
					});
				}
			}
			await pool.join();

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
