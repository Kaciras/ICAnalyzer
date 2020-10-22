import React, { useState } from "react";
import Styles from "./CompressDialog.scss";
import { BatchEncoder, ConvertOutput, createWorkers, MeasureOptions } from "../encoding";
import ProgressPanel from "./ProgressPanel";
import ConfigPanel from "./ConfigPanel";
import { decode } from "../decode";

interface EncodingEvent {
	file: File;
	workerCount: number;
	encoder: string;
	optionsList: any[];
	measure: MeasureOptions;
}

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

		const encoder = createWorkers();
		encoder.onProgress = setProgress;

		setEncoder(encoder);
		setMax(optionsList.length);
		setProgress(0);

		const [image] = await decode(file);
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
