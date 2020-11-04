import React, { ChangeEvent, ReactNode, useEffect, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import GitHubIcon from "../assets/github-logo.svg";
import { IconButton, RangeInput } from "../ui";
import CompressSession from "./CompressSession";
import Chart from "./Chart";
import style from "./App.scss";
import ImageView from "./ImageView";
import { ConvertOutput } from "../encode";
import { ImageEncoder } from "../codecs";
import * as WebP from "../codecs/webp";

export interface InputImage {
	file: File;
	data: ImageData;
}

export interface Result {
	original?: InputImage;
	codec?: ImageEncoder;
	outputs: ConvertOutput[];
}

const PLACEHOLDER: Result = {
	codec: undefined,
	original: undefined,
	outputs: [],
};

interface DownloadButtonProps {
	title?: string;
	buffer?: ArrayBuffer;
	encoder?: ImageEncoder;
	filename?: string;
	children: ReactNode;
}

function DownloadButton(props: DownloadButtonProps) {
	const { title, buffer, filename, children } = props;
	const { mimeType, extension } = props.encoder || {};

	const [url, setUrl] = useState("");
	useEffect(() => () => URL.revokeObjectURL(url), []);

	function downloadImage() {
		const blob = new Blob([buffer!], { type: mimeType });

		URL.revokeObjectURL(url);
		const newUrl = URL.createObjectURL(blob);
		setUrl(newUrl);

		const a = document.createElement("a");
		a.href = newUrl;
		a.download = filename!.replace(/.[^.]*$/, `.${extension}`);
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
	const [results, setResults] = useState(PLACEHOLDER);

	const [showChart, setShowChart] = useState(false);
	const [showDialog, setShowDialog] = useState(true);
	const [index, setIndex] = useState(0);
	const [series, setSeries] = useState<ConvertOutput[]>([]);

	async function showResult(result: Result) {
		setResults(result);
		setSeries(result.outputs);
		setIndex(75);
		setShowChart(true);
		setShowDialog(false);
	}

	function handleVariableChange(event: ChangeEvent<HTMLInputElement>) {
		// setSeries(results.outputs);
		setIndex(event.currentTarget.valueAsNumber);
	}

	return (
		<>
			<ImageView {...results} optimized={results.outputs[index]}/>

			{showChart && <Chart original={results.original} outputs={series} index={index}/>}

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
					filename={results.original?.file.name}
					encoder={results.codec}
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
						onChange={handleVariableChange}
					/>
				</label>
			</div>

			{showDialog && <CompressSession onClose={() => setShowDialog(false)} onChange={showResult}/>}
		</>
	);
}
