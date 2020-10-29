import React, { ReactNode, useEffect, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import GitHubIcon from "../assets/github-logo.svg";
import { IconButton, RangeInput } from "../ui";
import CompressDialog from "./CompressDialog";
import Chart from "./Chart";
import style from "./App.scss";
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
	const [showDialog, setShowDialog] = useState(true);
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

	// Show chart on result change, but skip the first.
	useEffect(() => setShowChart(results !== PLACEHOLDER), [results]);

	return (
		<>
			<ImageView {...results} optimized={results.outputs[index]}/>

			{showChart && <Chart {...results} index={index}/>}

			<div className={style.buttonGroup}>
				<IconButton
					title="Fork me from GitHub"
					href="https://github.com/Kaciras/ICAnalyze"
					className={style.iconButton}
				>
					<GitHubIcon/>
				</IconButton>
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
					<p>
						Quality (-q)
						<span className={style.optionValue}>{index}</span>
					</p>
					<RangeInput
						value={index}
						min={0}
						step={1}
						max={100}
						onChange={e => setIndex(e.currentTarget.valueAsNumber)}
					/>
				</label>
			</div>

			{showDialog && <CompressDialog onClose={() => setShowDialog(false)} onChange={showResult}/>}
		</>
	);
}
