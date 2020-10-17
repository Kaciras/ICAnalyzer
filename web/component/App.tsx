import React, { FormEvent, useState } from "react";
import IconButton from "./IconButton";
import CompressDialog from "./CompressDialog";
import Chart from "./Chart";
import style from "./App.scss";
import RangeInput from "./RangeInput";
import ImageView from "./ImageView";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";

interface Result {
	original: string;
	width: number;
	height: number;

	optimizedImages: ImageBitmap[];
	metrics: number[];
}

const PLACEHOLDER: Result = {
	original: "",
	width: 0,
	height: 0,
	optimizedImages: [],
	metrics: [],
};

export default function App() {
	const [showDialog, setShowDialog] = useState(false);
	const [showChart, setShowChart] = useState(false);
	const [index, setIndex] = useState(0);
	const [results, setResults] = useState(PLACEHOLDER);

	async function showResult(file: File, encodedFiles: ArrayBuffer[], metrics: number[]) {
		setShowDialog(false);

		const bitmaps: ImageBitmap[] = [];
		for (const data of encodedFiles) {
			const blob = new Blob([data], { type: "image/webp" });
			bitmaps.push(await createImageBitmap(blob));
		}

		URL.revokeObjectURL(results.original);

		setResults({
			original: URL.createObjectURL(file),
			width: bitmaps[0].width,
			height: bitmaps[0].height,
			optimizedImages: bitmaps,
			metrics,
		});

		setIndex(75);
	}

	function handleIndexChange(e: FormEvent<HTMLInputElement>) {
		const i = e.currentTarget.valueAsNumber;
		setIndex(i);
		// setOptimized(results[i]);
		// canvasRef.current!.getContext("2d")!.drawImage(results[i], 0, 0);
		// chart.dispatchAction({ type: "showTip", x: i, y: 0,position: ["50%", "50%"] });
	}

	function downloadImage() {
		const image = results.optimizedImages[index];
		const x = URL.createObjectURL(image);
		window.open(x, "__blank");
	}

	return (
		<>
			<section className={style.main}>

				<ImageView {...results} optimized={results.optimizedImages[index]}/>

				{showChart && <Chart options={results}/>}

				<div className={style.buttonGroup}>
					<IconButton
						title="Select an image"
						className={style.iconButton}
						onClick={() => setShowDialog(true)}
					>
						<UploadIcon/>
					</IconButton>
					<IconButton
						title="Show chart"
						className={style.iconButton}
						disabled={results === PLACEHOLDER}
						active={showChart}
						onClick={() => setShowChart(!showChart)}
					>
						<ChartIcon/>
					</IconButton>
					<IconButton
						title="Download compressed image"
						className={style.iconButton}
						disabled={results === PLACEHOLDER}
						onClick={downloadImage}
					>
						<DownloadIcon/>
					</IconButton>
				</div>

				<form className={style.variableGroup}>
					<label>
						<p>Quality (-q) {index}</p>
						<RangeInput
							value={index}
							min={0}
							step={1}
							max={100}
							onChange={handleIndexChange}
						/>
					</label>
				</form>
			</section>

			{showDialog && <CompressDialog onClose={() => setShowDialog(false)} onChange={showResult}/>}
		</>
	);
}
