import React, { FormEvent, useRef, useState } from "react";
import ImageDiff from "./ImageDiff";
import type { EChartOption } from "echarts";
import Chart from "./Chart";
import style from "./App.scss";
import CompressDialog from "./CompressDialog";

export default function App() {
	const [original, setOriginal] = useState<File>();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const [results, setResults] = useState<ImageBitmap[]>([]);
	const [brightness, setBrightness] = useState(100);
	const [optimized, setOptimized] = useState<ImageBitmap>();

	const [index, setIndex] = useState(0);
	const [chartOptions, setChartOptions] = useState<EChartOption>({});

	const [showDialog, setShowDialog] = useState(false);

	async function showResult(file: File, encodedFiles: Uint8Array[]) {
		setShowDialog(false);

		const bitmaps: ImageBitmap[] = [];
		for (const data of encodedFiles) {
			const blob = new Blob([data], { type: "image/webp" });
			bitmaps.push(await createImageBitmap(blob));
		}
		setResults(bitmaps);

		setChartOptions({
			title: {
				text: "Quality (-q)",
			},
			tooltip: {
				trigger: "axis",
			},
			legend: {
				data: ["Compression Ratio"],
			},
			xAxis: {
				data: encodedFiles.map((_, i) => i),
			},
			yAxis: {},
			series: [{
				name: "Compression Ratio %",
				type: "line",
				data: encodedFiles.map(({ length }) => length / file.size * 100),
			}],
		});

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
				<Chart options={chartOptions}/>
				<form className={style.form}>
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
					<label>
						brightness %
						<input
							type="number"
							min={100}
							step={50}
							value={brightness}
							onChange={e => setBrightness(e.currentTarget.valueAsNumber)}
						/>
					</label>
				</form>
				<button onClick={() => setShowDialog(true)}>Show Dialog</button>
				{ showDialog && <CompressDialog onClose={() => setShowDialog(false)} onChange={showResult}/> }
			</section>
		</>
	);
}
