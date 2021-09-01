import { Dispatch, useState } from "react";
import { ENCODERS } from "../codecs";
import { decode } from "../decode";
import { AnalyzeResult, getPooledWorker, ImagePool, newImagePool, setOriginalImage } from "../image-worker";
import { OptionsKey } from "../form";
import { prepareMeasure } from "../measurement";
import { ObjectKeyMap, useProgress } from "../utils";
import { AnalyzeContext, ControlsMap, InputImage } from ".";
import SelectFileDialog from "./SelectFileDialog";
import ConfigDialog, { AnalyzeConfig } from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";

interface CompressSessionProps {
	isOpen: boolean;
	onChange: Dispatch<AnalyzeContext>;
	onClose: () => void;
}

export default function CompressSession(props: CompressSessionProps) {
	const { isOpen, onClose, onChange } = props;

	const [selectFile, setSelectFile] = useState(true);
	const [input, setInput] = useState<InputImage>();
	const [encoder, setEncoder] = useState<ImagePool>();

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

		const pool = newImagePool(measurement.workerCount);
		setEncoder(pool);

		await setOriginalImage(pool, input);
		const worker = getPooledWorker(pool);

		const { calculations, metricsMeta, execute } = prepareMeasure(input, measurement);
		if (measurement.encodeTime.enabled) {
			metricsMeta.push({ key: "time", name: "Encode Time (s)" });
		}

		const controlsMap: ControlsMap = {};
		const outputMap = new ObjectKeyMap<OptionsKey, AnalyzeResult>();
		const tasks = [];

		for (const encoder of ENCODERS) {
			const { name } = encoder;
			const { enable, state } = encoding[name];
			if (!enable) {
				continue;
			}
			const filename = file.name.replace(/.[^.]*$/, `.${encoder.extension}`);
			controlsMap[name] = encoder.getControls(state);
			const optionsList = encoder.getOptionsList(state);


			tasks.push(...optionsList.map(async item => {
				const { key, options } = item;
				const { buffer, time } = await encoder.encode(options, worker);

				const file = new File([buffer], filename, { type: encoder.mimeType });
				progress.increase();

				const output: AnalyzeResult = {
					file,
					data: await decode(file, worker),
					metrics: { time },
				};
				outputMap.set({ codec: encoder.name, key }, output);
				await execute(worker, output, progress.increase);
			}));
		}

		progress.reset(tasks.length * (1 + calculations));

		try {
			await Promise.all(tasks);
			setEncoder(undefined);
			onChange({
				input,
				controlsMap,
				seriesMeta: metricsMeta,
				outputMap,
			});
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
