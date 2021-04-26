import { Dispatch, useState } from "react";
import { builtinResize } from "squoosh/src/client/lazy-app/util";
import { InputImage, Result } from "./index";
import CompareDialog from "./CompareDialog";
import { ConvertOutput, getMetricsMeta, measureFor, newWorker, ObjectKeyMap } from "../encode";
import { Button, Dialog } from "../ui";
import { WorkerApi } from "../worker";
import { useProgress } from "../utils";
import ProgressDialog from "./ProgressDialog";
import WorkerPool from "../WorkerPool";
import MetricsPanel, { getMeasureOptions } from "./MetricsPanel";
import styles from "./ConfigDialog.scss";

export interface CompareData {
	original: InputImage;
	changed: InputImage;
}

interface CompareSessionProps {
	isOpen: boolean;
	onChange: Dispatch<Result>;
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
		const imageA = data.original.raw;
		let imageB = data.changed.raw;

		const pool = new WorkerPool<WorkerApi>(newWorker, measure.workerCount);
		setWorkers(pool);

		const seriesMeta = [{ key: "ratio", name: "Compression Ratio %" }];
		const { calculations, metricsMeta } = getMetricsMeta(measure);
		seriesMeta.push(...metricsMeta);
		progress.reset(1 + calculations);

		if (imageA.width !== imageB.width || imageA.height !== imageB.height) {
			imageB = await builtinResize(imageB, 0, 0,
				imageB.width, imageB.height, imageA.width, imageA.height, "high");
		}

		await pool.runOnEach(r => r.setImageToEncode(imageA));
		const measureFn = measureFor(pool, measure, progress.increase);

		const buffer = await data.changed.file.arrayBuffer();
		const outputMap = new ObjectKeyMap<any, ConvertOutput>();

		const ratio = buffer.byteLength / data.original.file.size * 100;
		const output: ConvertOutput = {
			buffer,
			data: imageB,
			metrics: { ratio },
		};
		measureFn(output);
		outputMap.set({}, output);

		await pool.join();

		if (!pool.terminated) {
			setWorkers(undefined);
			onChange({ input: data.original, outputMap, seriesMeta, controlsMap: {} });
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
		<Dialog name="Compare config" className={styles.dialog} onClose={onClose}>
			<h2>Measure Options</h2>
			<MetricsPanel
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
