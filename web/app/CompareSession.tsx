import { Dispatch, useState } from "react";
import { builtinResize } from "squoosh/src/client/lazy-app/util/canvas";
import { AnalyzeContext, InputImage } from "./index";
import { Button, Dialog } from "../ui";
import { OptionsKey } from "../form";
import RangeControl from "../form/RangeControl";
import { AnalyzeResult, getPooledWorker, ImagePool, newImagePool, setOriginalImage } from "../image-worker";
import { createMeasurer } from "../measurement";
import { ObjectKeyMap, useProgress } from "../utils";
import ProgressDialog from "./ProgressDialog";
import CompareDialog from "./CompareDialog";
import MeasurePanel, { getMeasureOptions } from "./MeasurePanel";
import styles from "./ConfigDialog.scss";

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
	const [measureOptions, setMeasureOptions] = useState(getMeasureOptions);
	const [imagePool, setImagePool] = useState<ImagePool>();

	const progress = useProgress();
	const [error, setError] = useState<string>();

	function handleAccept(data: CompareData) {
		setData(data);
		setSelectFile(false);
	}

	function handleSelectCancel() {
		data ? setSelectFile(false) : onClose();
	}

	async function handleStart() {
		if (!data || !measureOptions) {
			throw new Error("Missing required data");
		}
		const { original, changed } = data;

		localStorage.setItem("Measure", JSON.stringify(measureOptions));

		const controlsMap = {
			_: [
				new RangeControl({
					id: "i",
					label: "Index",
					min: 0,
					max: data.changed.length - 1,
					step: 1,
				}),
			],
		};

		const imagePool = newImagePool(measureOptions.workerCount);
		const worker = getPooledWorker(imagePool);
		const measurer = createMeasurer(measureOptions, worker);

		setImagePool(imagePool);
		await setOriginalImage(imagePool, original);

		const outputMap = new ObjectKeyMap<OptionsKey, AnalyzeResult>();

		for (let i = 0; i < changed.length; i++) {
			const { raw, file } = changed[i];
			const imageB = resizeToFit(raw, original.raw);

			const output: AnalyzeResult = {
				file,
				data: imageB,
				metrics: {},
			};
			outputMap.set({ codec: "_", key: { i } }, output);

			// noinspection ES6MissingAwait
			measurer.execute(original, output, progress.increase);
		}

		progress.reset(changed.length * (1 + measurer.calculations));
		try {
			await imagePool.join();
			setImagePool(undefined);
			onChange({
				input: original,
				outputMap,
				seriesMeta: measurer.metrics,
				controlsMap,
			});
		} catch (e) {
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

	if (selectFile) {
		return <CompareDialog
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
				error={error}
				onCancel={stop}
			/>
		);
	}

	return (
		<Dialog
			name="Compare config"
			className={styles.dialog}
			onClose={onClose}
		>
			<h2 className={styles.title}>
				Measure Options
			</h2>
			<MeasurePanel
				value={measureOptions}
				onChange={setMeasureOptions}
			/>
			<div className="dialog-actions">
				<Button
					onClick={() => setSelectFile(true)}
				>
					Select files...
				</Button>
				<Button
					className="second"
					onClick={onClose}
				>
					Cancel
				</Button>
				<Button
					onClick={handleStart}
				>
					Next
				</Button>
			</div>
		</Dialog>
	);
}
