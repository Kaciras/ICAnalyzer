import React, { FormEvent, useRef, useState } from "react";
import ImageDiff from "./ImageDiff";
import { createWebPEncoder } from "../encoding";
import type { WebPEncodeOptions } from "../worker/webp-encoder";
import Chart from "./Chart";
import style from "./App.scss";

export default function App() {
	const [original, setOriginal] = useState<File>();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const [max, setMax] = useState(1);
	const [progress, setProgress] = useState(0);

	const [results, setResults] = useState<ImageBitmap[]>([]);
	const [brightness, setBrightness] = useState(100);
	const [optimized, setOptimized] = useState<ImageBitmap>();

	const [index, setIndex] = useState(0);

	async function loadFile(event: FormEvent<HTMLInputElement>) {
		const file = event.currentTarget.files![0];
		const canvas = canvasRef.current!;

		const bitmap = await createImageBitmap(file);
		const { width, height } = bitmap;
		setWidth(width);
		setHeight(height);
		setOriginal(file);
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext("2d")!;
		ctx.drawImage(bitmap, 0, 0);
		const canvasData = ctx.getImageData(0, 0, width, height);

		// if (!(await isSupportAVIF())) {
		// 	return alert("Your browser does not support avif image.");
		// }

		return showResult(file, await encode(canvasData));
	}

	function encode(image: ImageData) {
		const optionsList = new Array<WebPEncodeOptions>(101);
		for (let i = 0; i < 101; i++) {
			optionsList[i] = { quality: i };
		}

		setMax(optionsList.length);
		setProgress(0);

		const encoder = createWebPEncoder();
		encoder.onProgress = setProgress;
		return encoder.encode(image, optionsList).start();
	}

	async function showResult(file: File, encodedFiles: Uint8Array[]) {

		const bitmaps: ImageBitmap[] = [];
		for (const data of encodedFiles) {
			const blob = new Blob([data], { type: "image/webp" });
			bitmaps.push(await createImageBitmap(blob));
		}
		setResults(bitmaps);

		// const chart = drawChart({
		// 	title: {
		// 		text: "Quality (-q)"
		// 	},
		// 	tooltip: {
		// 		trigger: "axis",
		// 	},
		// 	legend: {
		// 		data: ["Compression Ratio"]
		// 	},
		// 	xAxis: {
		// 		data: encodedFiles.map((_, i) => i)
		// 	},
		// 	yAxis: {},
		// 	series: [{
		// 		name: "Compression Ratio %",
		// 		type: "line",
		// 		data: encodedFiles.map(({ length }) => length / file.size * 100),
		// 	}],
		// });


		setIndex(75);
		setOptimized(bitmaps[75]);
	}

	function handleIndexChange(e: FormEvent<HTMLInputElement>) {
		const i = e.currentTarget.valueAsNumber;
		setIndex(i);
		setOptimized(results[i]);
		canvasRef.current!.getContext("2d")!.drawImage(results[i], 0, 0);
		// chart.dispatchAction({ type: "showTip", x: i, y: 0,position: ["50%", "50%"] });
	}

	return (
		<>
			<section className={style.imageViews}>
				<ImageDiff
					original={original}
					optimized={optimized}
					width={width}
					height={height}
					brightness={brightness}
				/>
				<canvas ref={canvasRef}/>
			</section>
			<section>
				<Chart/>
				<form className={style.form}>
					<input type="file" accept="image/*" onChange={loadFile}/>

					<label>
						<p>Quality (-q) {index}</p>
						<input
							className={style.range}
							type="range"
							value={index}
							min={0}
							step={1}
							onChange={handleIndexChange}
						/>
					</label>

					<input
						id="brightness"
						type="number"
						min={100}
						step={50}
						value={brightness}
						onChange={e => setBrightness(e.currentTarget.valueAsNumber)}
					/>

					<progress id="progress" value={progress} max={max}/>
				</form>
			</section>
		</>
	);
}
