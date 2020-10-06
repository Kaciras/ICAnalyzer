import React, { FormEvent, useRef, useState } from "react";
import type { EChartOption } from "echarts";
import IconButton from "./IconButton";
import CompressDialog from "./CompressDialog";
import Chart from "./Chart";
import ImageDiff from "./ImageDiff";
import style from "./App.scss";

export default function App() {
	const [original, setOriginal] = useState<File>();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const [results, setResults] = useState<ImageBitmap[]>([]);

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
			<section className={style.main}>
				<ImageDiff
					original={original}
					optimized={optimized}
					width={width}
					height={height}
				/>
				<canvas ref={canvasRef}/>

				<Chart options={chartOptions}/>

				<div className={style.buttonGroup}>
					<IconButton
						title="Show chart"
						icon={require("bootstrap-icons/icons/bar-chart-line.svg")}
					/>
					<IconButton
						title="Select file"
						onClick={() => setShowDialog(true)}
						icon={require("bootstrap-icons/icons/cloud-upload.svg")}
					/>
					<IconButton
						title="Download"
						disabled={true}
						onClick={() => setShowDialog(true)}
						icon={require("bootstrap-icons/icons/download.svg")}
					/>
				</div>

				<form className={style.variableGroup}>
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
				</form>
			</section>

			{showDialog && <CompressDialog onClose={() => setShowDialog(false)} onChange={showResult}/>}
		</>
	);
}
