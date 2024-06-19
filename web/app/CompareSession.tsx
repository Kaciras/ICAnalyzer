import { Dispatch, useState } from "react";
import { builtinResize } from "squoosh/src/client/lazy-app/util/canvas.ts";
import { AnalyzeContext } from "./index.ts";
import RangeControl from "../form/control/RangeControl.tsx";
import {
	AnalyzeResult,
	getPooledWorker,
	ImagePool,
	InputImage,
	newImagePool,
	setOriginalImage,
} from "../features/image-worker.ts";
import { createMeasurer, MeasureOptions } from "../features/measurement.ts";
import { useProgress } from "../hooks.ts";
import ProgressDialog from "./ProgressDialog.tsx";
import CompareFileDialog from "./CompareFileDialog.tsx";
import CompareConfigDialog from "./CompareConfigDialog.tsx";

export interface CompareData {
	original: InputImage;
	changed: InputImage[];
}

function resizeToFit(image: ImageData, target: ImageData) {
	const { width: w0, height: h0 } = image;
	const { width: w1, height: h1 } = target;

	if (w0 === w1 && h0 === h1) {
		return image;
	}
	return builtinResize(image, 0, 0, w0, h0, w1, h1, "high");
}

interface CompareSessionProps {
	isOpen: boolean;
	onChange: Dispatch<AnalyzeContext>;
	onClose: () => void;
}

export default function CompareSession(props: CompareSessionProps) {
	const { isOpen, onChange, onClose } = props;

	const [selectFile, setSelectFile] = useState(true);
	const [data, setData] = useState<CompareData>();
	const [imagePool, setImagePool] = useState<ImagePool>();

	const progress = useProgress();

	function handleAccept(data: CompareData) {
		setData(data);
		setSelectFile(false);
	}

	function handleSelectCancel() {
		data ? setSelectFile(false) : onClose();
	}

	async function handleStart(measureOptions: MeasureOptions) {
		if (!data || !measureOptions) {
			throw new Error("Missing required data");
		}
		const { original, changed } = data;

		const control = new RangeControl({
			id: "i",
			label: "Index",
			min: 0,
			step: 1,
			max: data.changed.length - 1,
		});

		const controlsMap = { _: [control] };

		const imagePool = newImagePool(measureOptions.workerCount);
		const worker = getPooledWorker(imagePool);
		const measurer = createMeasurer(measureOptions, worker);

		setImagePool(imagePool);
		await setOriginalImage(imagePool, original);

		const outputs = [];
		for (let i = 0; i < changed.length; i++) {
			const { raw, file } = changed[i];
			const imageB = resizeToFit(raw, original.raw);

			const output: AnalyzeResult = {
				file,
				data: imageB,
				metrics: {},
			};
			outputs.push(output);

			// noinspection ES6MissingAwait
			measurer.execute(original, output, progress.increase);
		}

		progress.reset(changed.length * (1 + measurer.calculations));
		try {
			await imagePool.join();
			setImagePool(undefined);
			onChange({
				input: original,
				outputs,
				offsetMap: new Map<string, number>([["_", 0]]),
				weightMap: new Map<string, number[]>([["_", [1]]]),
				seriesMeta: measurer.metrics,
				controlsMap,
			});
		} catch (e) {
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

	if (selectFile) {
		return <CompareFileDialog
			data={data}
			onAccept={handleAccept}
			onCancel={handleSelectCancel}
		/>;
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
	}

	return (
		<CompareConfigDialog
			onStart={handleStart}
			onClose={onClose}
			onSelectFile={() => setSelectFile(true)}
		/>
	);
}
