import { Dispatch, useState } from "react";
import { builtinResize } from "squoosh/src/client/lazy-app/util/canvas";
import { AnalyzeContext, InputImage } from "./index";
import { Analyzer, AnalyzeResult, newWorker, ObjectKeyMap } from "../analyzing";
import { Button, Dialog } from "../ui";
import { WorkerApi } from "../worker";
import { OptionsKey } from "../form";
import { useProgress } from "../utils";
import ProgressDialog from "./ProgressDialog";
import WorkerPool from "../WorkerPool";
import CompareDialog from "./CompareDialog";
import MeasurePanel, { getMeasureOptions } from "./MeasurePanel";
import styles from "./ConfigDialog.scss";

export interface CompareData {
	original: InputImage;
	changed: InputImage;
}

function resizeToFit(image: ImageData, target: ImageData) {
	const { width: w0, height: h0 } = image;
	const { width: w1, height: h1 } = target;

	if (w0 === w1 && h0 === h1) {
		return image;
	}
	return builtinResize(image, 0, 0, w0, h0, w1, h1, "high");
}

async function compare(data: CompareData, analyzer: Analyzer, pool: WorkerPool<WorkerApi>) {
	const { original, changed } = data;

	const imageA = original.raw;
	const imageB = resizeToFit(changed.raw, imageA);

	const buffer = await changed.file.arrayBuffer();
	const outputMap = new ObjectKeyMap<OptionsKey, AnalyzeResult>();

	await analyzer.setOriginalImage(original);

	const ratio = buffer.byteLength / original.file.size * 100;
	const output: AnalyzeResult = {
		file: changed.file,
		data: imageB,
		metrics: { ratio },
	};
	analyzer.measure(output);
	outputMap.set({}, output);

	return pool.join().then(() => outputMap);
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
	const [measure, setMeasure] = useState(getMeasureOptions);

	const [workers, setWorkers] = useState<WorkerPool<WorkerApi>>();
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
		if (!data || !measure) {
			throw new Error("Missing required data");
		}
		const { original } = data;

		localStorage.setItem("Measure", JSON.stringify(measure));

		const pool = new WorkerPool<WorkerApi>(newWorker, measure.workerCount);
		const analyzer = new Analyzer(pool, measure);

		const seriesMeta = [
			{ key: "ratio", name: "Compression Ratio %" },
		];
		const { calculations, metricsMeta } = analyzer.getMetricsMeta();
		seriesMeta.push(...metricsMeta);

		setWorkers(pool);
		progress.reset(1 + calculations);
		try {
			const outputMap = await compare(data, analyzer, pool);

			if (!pool.terminated) {
				setWorkers(undefined);
				onChange({ input: original, outputMap, seriesMeta, controlsMap: {} });
			}
		} catch (e) {
			console.error(e);
			setError(e.message);
		}

		pool.terminate();
	}

	function stop() {
		workers!.terminate();
		setWorkers(undefined);
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

	if (workers) {
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
				value={measure}
				onChange={setMeasure}
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
