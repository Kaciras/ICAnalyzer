import { Dispatch, useState } from "react";
import { wrap } from "comlink";
import { builtinResize } from "squoosh/src/client/lazy-app/util";
import { InputImage, Result } from "./index";
import CompareDialog from "./CompareDialog";
import { BatchEncodeAnalyzer, MeasureOptions, newWorker } from "../encode";
import { Button, Dialog } from "../ui";
import { WorkerApi } from "../worker";

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
	const [measure, setMeasure] = useState<MeasureOptions>();

	function handleAccept(data: CompareData) {
		setData(data);
		setSelectFile(false);
	}

	function handleSelectCancel() {
		data ? setSelectFile(false) : onClose();
	}

	async function handleStart() {
		const imageA = data!.original.raw;
		let imageB = data!.changed.raw;

		if (imageA.width !== imageB.width || imageA.height !== imageB.height) {
			imageB = await builtinResize(imageB, 0, 0,
				imageB.width, imageB.height, imageA.width, imageA.height, "high");
		}

		const remote = wrap<WorkerApi>(newWorker());
		const worker = new BatchEncodeAnalyzer();
		await remote.setImageToEncode(imageA);
		const metrics = await worker.measure(remote, imageB, measure);

		onChange({
			input: data!.original,
			config: {
				measure,
				encoders: {},
			},
			outputMap: {},
		});
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

	return (
		<Dialog name="Compare config" onClose={onClose}>
			<div>

			</div>
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
