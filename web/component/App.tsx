import React, { FormEvent, ReactNode, useEffect, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import IconButton from "./IconButton";
import CompressDialog from "./CompressDialog";
import Chart from "./Chart";
import style from "./App.scss";
import RangeInput from "./RangeInput";
import ImageView from "./ImageView";
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

interface DownloadButtonProps {
	title?: string;
	buffer?: ArrayBuffer;
	filename?: string;
	children: ReactNode;
}

function DownloadButton(props: DownloadButtonProps) {
	const { title, buffer, filename, children } = props;

	const [url, setUrl] = useState("");
	useEffect(() => () => URL.revokeObjectURL(url), []);

	function downloadImage() {
		const blob = new Blob([buffer!], { type: "image/webp" });

		URL.revokeObjectURL(url);
		const newUrl = URL.createObjectURL(blob);
		setUrl(newUrl);

		const a = document.createElement("a");
		a.href = url;
		a.download = filename!.split(".").pop()!;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	return (
		<IconButton
			className={style.iconButton}
			title={title}
			disabled={!buffer}
			onClick={downloadImage}
		>
			{children}
		</IconButton>
	);
}

export default function App() {
	const [showDialog, setShowDialog] = useState(false);
	const [showChart, setShowChart] = useState(false);
	const [index, setIndex] = useState(0);
	const [results, setResults] = useState(PLACEHOLDER);

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

	// Show chart on result change, but skip the first.
	useEffect(() => setShowChart(results !== PLACEHOLDER), [results]);

	return (
		<>
			<ImageView {...results} optimized={results.outputs[index]}/>

			{showChart && <Chart {...results}/>}

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
				<DownloadButton
					title="Download compressed image"
					filename={results.original?.name}
					buffer={results.outputs[index]?.buffer}
				>
					<DownloadIcon/>
				</DownloadButton>
			</div>

			<div className={style.variableGroup}>
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
			</div>

			{showDialog && <CompressDialog onClose={() => setShowDialog(false)} onChange={showResult}/>}
		</>
	);
}
