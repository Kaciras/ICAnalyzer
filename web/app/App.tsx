import { ReactNode, useEffect, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import GitHubIcon from "../assets/github-logo.svg";
import { IconButton } from "../ui";
import CompressSession, { ImageToEncoderNames } from "./CompressSession";
import Chart from "./Chart";
import style from "./App.scss";
import ImageView from "./ImageView";
import { ConvertOutput } from "../encode";
import { ImageEncoder } from "../codecs";
import ControlPanel from "./ControlPanel";
import * as WebP from "../codecs/webp/client";

export interface InputImage {
	file: File;
	data: ImageData;
}

export interface Result {
	original?: InputImage;
	state: Record<string, any>;
	map: ImageToEncoderNames;
}

const PLACEHOLDER: Result = {
	original: undefined,
	state: {},
	map: new Map(),
};

interface DownloadButtonProps {
	title?: string;
	buffer?: ArrayBuffer;
	filename?: string;
	codec: ImageEncoder;
	children: ReactNode;
}

function DownloadButton(props: DownloadButtonProps) {
	const { title, buffer, filename, children } = props;
	const { mimeType, extension } = props.codec;

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

	const [image, setImage] = useState<ImageData>();
	const [series, setSeries] = useState<ConvertOutput[]>([]);
	const [output, setOutput] = useState<ConvertOutput>();

	async function showResult(result: Result) {
		setResults(result);
		setImage(result.map.keys().next().value);

		setShowChart(true);
		setShowDialog(false);
	}

	const index = series.indexOf(output!);

	return (
		<>
			<ImageView {...results} optimized={output}/>

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
					codec={WebP}
					buffer={output?.buffer}
				>
					<DownloadIcon/>
				</DownloadButton>
			</div>

			{
				results.original &&
				<ControlPanel
					result={results}
					onImageChange={setImage}
					onSeriesChange={setSeries}
					onOutputChange={setOutput}
				/>
			}

			<CompressSession
				open={showDialog}
				onClose={() => setShowDialog(false)}
				onChange={showResult}
			/>
		</>
	);
}
