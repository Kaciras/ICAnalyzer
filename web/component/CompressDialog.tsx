import React, { useState } from "react";
import Styles from "./CompressDialog.scss";
import { BatchEncoder, createWorkers } from "../encoding";
import ProgressPanel from "./ProgressPanel";
import ConfigPanel from "./ConfigPanel";

interface Props {
	onChange: (file: File, encodedFiles: Uint8Array[]) => void;
	onClose: () => void;
}

export default function CompressDialog(props: Props) {
	const [encoder, setEncoder] = useState<BatchEncoder<unknown>>();

	const [max, setMax] = useState(1);
	const [progress, setProgress] = useState(0);

	async function handleStart(file: File, optionsList: any[]) {
		if (!file) {
			throw new Error("File is null");
		}

		const canvas = document.createElement("canvas");
		const bitmap = await createImageBitmap(file);
		const { width, height } = bitmap;
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d")!;
		ctx.drawImage(bitmap, 0, 0);
		const canvasData = ctx.getImageData(0, 0, width, height);

		props.onChange(file, await encode(canvasData, optionsList));
	}

	function encode(image: ImageData, optionsList: any[]) {
		const encoder = createWorkers();

		setEncoder(encoder);
		setMax(optionsList.length);
		setProgress(0);

		encoder.onProgress = setProgress;
		return encoder.encode(image, optionsList).start();
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
