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
import { ConvertOutput } from "../encoding";

interface Result {
	original?: File;
	width: number;
	height: number;

	outputs: ConvertOutput[];
}

const PLACEHOLDER: Result = {
	original: undefined,
	width: 0,
	height: 0,
	outputs: [],
};

export default function App() {
	const [showDialog, setShowDialog] = useState(false);
	const [showChart, setShowChart] = useState(false);
	const [index, setIndex] = useState(0);
	const [results, setResults] = useState(PLACEHOLDER);
	const [downloadUrl, setDownloadUrl] = useState("");

	async function showResult(original: File, outputs: ConvertOutput[]) {
		setResults({
			outputs,
			original,
			width: outputs[0].bitmap.width,
			height: outputs[0].bitmap.height,
		});
		setIndex(75);
		setShowDialog(false);
	}

	function handleIndexChange(e: FormEvent<HTMLInputElement>) {
		const i = e.currentTarget.valueAsNumber;
		setIndex(i);
		// setOptimized(results[i]);
		// canvasRef.current!.getContext("2d")!.drawImage(results[i], 0, 0);
		// chart.dispatchAction({ type: "showTip", x: i, y: 0,position: ["50%", "50%"] });
	}

	function downloadImage() {
		const { buffer } = results.outputs[index];
		const url = URL.createObjectURL(new Blob([buffer], { type: "image/webp" }));

		URL.revokeObjectURL(downloadUrl);
		setDownloadUrl(url);

		const a = document.createElement("a");
		a.href = url;
		a.download = results.original!.name.split(".").pop()!;
		a.click();
	}

	return (
		<>
			<section className={style.main}>

				<ImageView {...results} optimized={results.outputs[index]}/>

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
