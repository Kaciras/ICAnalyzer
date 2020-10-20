import React, { useState } from "react";
import Styles from "./CompressDialog.scss";
import {
	BatchEncoder,
	ConvertOutput,
	createWorkers,
	decodeAVIF,
	decodeImage,
	decodeWebP,
	MeasureOptions,
	svgToImageData,
} from "../encoding";
import ProgressPanel from "./ProgressPanel";
import ConfigPanel from "./ConfigPanel";

interface Props {
	onChange: (file: File, results: ConvertOutput[]) => void;
	onClose: () => void;
}

export default function CompressDialog(props: Props) {
	const [encoder, setEncoder] = useState<BatchEncoder<unknown>>();

	const [max, setMax] = useState(1);
	const [progress, setProgress] = useState(0);

	async function handleStart(file: File, optionsList: any[], measure: MeasureOptions, workerCount: number) {
		if (!file) {
			throw new Error("File is null");
		}

		let image: ImageData;
		switch (file.type) {
			case "image/svg+xml":
				image = await svgToImageData(await file.text());
				break;
			case "image/webp":
				[image] = await decodeWebP(await file.arrayBuffer());
				break;
			case "image/avif":
				[image] = await decodeAVIF(await file.arrayBuffer());
				break;
			default:
				[image] = await decodeImage(file);
		}

		const encoder = createWorkers();

		setEncoder(encoder);
		setMax(optionsList.length);
		setProgress(0);

		encoder.onProgress = setProgress;
		const outputs = await encoder.encode(image, optionsList, measure).start(workerCount);

		props.onChange(file, outputs);
	}

	function stop() {
		setEncoder(undefined);
		encoder!.stop();
	}

	let panel;

	if (encoder) {
		panel = <ProgressPanel value={progress} max={max} onCancel={stop}/>;
	} else {
		panel = <ConfigPanel onStart={handleStart} onClose={props.onClose}/>;
	}

	return (
		<div className={Styles.dimmer}>
			<div className={Styles.dialog}>
				{panel}
			</div>
		</div>
	);
}
