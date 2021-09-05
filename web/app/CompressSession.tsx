import { Dispatch, useState } from "react";
import { ENCODERS, ImageEncoder } from "../codecs";
import { decode } from "../features/decode";
import {
	AnalyzeResult,
	getPooledWorker,
	ImagePool,
	ImageWorker,
	InputImage,
	newImagePool,
	setOriginalImage,
} from "../features/image-worker";
import { OptionsKey, OptionsKeyPair } from "../form";
import { createMeasurer, Measurer } from "../features/measurement";
import { NOOP, ObjectKeyMap, useProgress } from "../utils";
import { AnalyzeContext, ControlsMap } from ".";
import SelectFileDialog from "./SelectFileDialog";
import CompressConfigDialog, { AnalyzeConfig } from "./CompressConfigDialog";
import ProgressDialog from "./ProgressDialog";

interface EncodeTask {
	encoder: ImageEncoder;
	optionsList: OptionsKeyPair[];
}

class EncodeAnalyzer {

	private readonly config: AnalyzeConfig;
	private readonly worker: ImageWorker;

	private readonly controlsMap: ControlsMap;
	private readonly taskQueue: EncodeTask[];
	private readonly measurer: Measurer;

	readonly outputSize: number;

	onProgress: () => void;

	constructor(config: AnalyzeConfig, worker: ImageWorker) {
		this.config = config;
		this.worker = worker;

		this.controlsMap = {};
		this.taskQueue = [];
		this.outputSize = 0;
		this.onProgress = NOOP;
		this.measurer = createMeasurer(config.measurement, worker);

		if (config.measurement.encodeTime.enabled) {
			this.measurer.metrics.push({ key: "time", name: "Encode Time (s)" });
		}

		for (const encoder of ENCODERS) {
			const { name } = encoder;
			const { enable, state } = config.encoding[name];
			if (!enable) {
				continue;
			}
			const optionsList = encoder.getOptionsList(state);
			this.taskQueue.push({ encoder, optionsList });
			this.outputSize += optionsList.length;
			this.controlsMap[name] = encoder.getControls(state);
		}
	}

	get TaskCount() {
		return this.outputSize * (1 + this.measurer.calculations);
	}

	run(input: InputImage) {
		const { worker, controlsMap, measurer, taskQueue } = this;
		const outputMap = new ObjectKeyMap<OptionsKey, AnalyzeResult>();
		const tasks = [];

		for (const { encoder, optionsList } of taskQueue) {
			const filename = input.file.name.replace(/.[^.]*$/, `.${encoder.extension}`);

			tasks.push(...optionsList.map(async item => {
				const { key, options } = item;
				const { buffer, time } = await encoder.encode(options, worker);

				const file = new File([buffer], filename, { type: encoder.mimeType });
				this.onProgress();

				const output: AnalyzeResult = {
					file,
					data: await decode(file, worker),
					metrics: { time },
				};
				outputMap.set({ codec: encoder.name, key }, output);
				await measurer.execute(input, output, this.onProgress);
			}));
		}

		const seriesMeta = measurer.metrics;
		return Promise.all(tasks).then(() => ({ input, controlsMap, seriesMeta, outputMap }));
	}
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
	const [imagePool, setImagePool] = useState<ImagePool>();

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
		const { measurement } = config;

		const imagePool = newImagePool(measurement.workerCount);
		const worker = getPooledWorker(imagePool);
		const analyzer = new EncodeAnalyzer(config, worker);

		progress.reset(analyzer.TaskCount);
		analyzer.onProgress = progress.increase;
		setImagePool(imagePool);

		try {
			await setOriginalImage(imagePool, input);
			onChange(await analyzer.run(input));
			setImagePool(undefined);
		} catch (e) {
			// Some browsers will crash the page on OOM.
			console.error(e);
			setError(e.message);
		} finally {
			imagePool.terminate();
		}
	}

	function stop() {
		imagePool!.terminate();
		setImagePool(undefined);
	}

	if (!isOpen) {
		return null;
	}

	if (imagePool) {
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
			<CompressConfigDialog
				image={input!}
				onStart={handleStart}
				onClose={onClose}
				onSelectFile={() => setSelectFile(true)}
			/>
		);
	}
}
