import { cartesianObject, CPSrcObject, noop } from "@kaciras/utilities/browser";
import { Dispatch, useState } from "react";
import { buildProfiles, ENCODERS, ImageEncoder } from "../codecs/index.ts";
import { decode } from "../features/decode.ts";
import {
	AnalyzeResult,
	getPooledWorker,
	ImagePool,
	ImageWorker,
	InputImage,
	newImagePool,
	setOriginalImage,
} from "../features/image-worker.ts";
import { createMeasurer, Measurer } from "../features/measurement.ts";
import { useProgress } from "../hooks.ts";
import { AnalyzeContext, ControlsMap } from "./index.tsx";
import SelectFileDialog from "./SelectFileDialog.tsx";
import CompressConfigDialog, { AnalyzeConfig } from "./CompressConfigDialog.tsx";
import ProgressDialog from "./ProgressDialog.tsx";

interface EncodeTask {
	encoder: ImageEncoder;
	variables: CPSrcObject;
	constants: any;
}

class EncodeAnalyzer {

	private readonly config: AnalyzeConfig;
	private readonly worker: ImageWorker;

	private readonly controlsMap: ControlsMap = {};
	private readonly taskQueue: EncodeTask[] = [];
	private readonly measurer: Measurer;
	// private readonly outputMap = new ObjectKeyMap<OptionsKey, AnalyzeResult>();

	readonly outputSize: number;

	onProgress = noop;

	constructor(config: AnalyzeConfig, worker: ImageWorker) {
		this.config = config;
		this.worker = worker;

		this.outputSize = 0;
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
			const { size, variables, constants, controls } = buildProfiles(encoder, state);
			this.outputSize += size;
			this.controlsMap[name] = controls;
			this.taskQueue.push({ encoder, variables, constants });
		}
	}

	get TaskCount() {
		return this.outputSize * (1 + this.measurer.calculations);
	}

	async run(input: InputImage) {
		const { controlsMap, measurer, taskQueue } = this;

		const tasks = [];
		const weightMap = new Map<string, number[]>();
		const offsetMap = new Map<string, number>();

		for (const { encoder, constants, variables } of taskQueue) {
			offsetMap.set(encoder.name, tasks.length);

			for (const mutation of cartesianObject(variables)) {
				const options = { ...constants, ...mutation };
				tasks.push(this.process(input, encoder, options));
			}

			const controls = controlsMap[encoder.name];
			const weights = new Array(controls.length);
			let weight = 1;
			for (let i = weights.length - 1; i >= 0; i--) {
				weights[i] = weight;
				weight *= controls[i].createState().length;
			}
			weightMap.set(encoder.name, weights);
		}

		const seriesMeta = measurer.metrics;
		const outputs = await Promise.all(tasks);
		return { input, seriesMeta, controlsMap, outputs, offsetMap, weightMap };
	}

	private async process(input: InputImage, encoder: ImageEncoder, options: any) {
		const { worker, measurer } = this;
		const { extension, mimeType } = encoder;

		const { buffer, time } = await encoder.encode(options, worker);
		this.onProgress();

		const filename = input.file.name.replace(/.[^.]*$/, `.${extension}`);
		const file = new File([buffer], filename, { type: mimeType });

		const output: AnalyzeResult = {
			file,
			data: await decode(file, worker),
			metrics: { time },
		};
		await measurer.execute(input, output, this.onProgress);
		return output;
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
			progress.setError(e.message);
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
				error={progress.error}
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
