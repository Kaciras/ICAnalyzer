import { ReactNode, useEffect, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import GitHubIcon from "../assets/github-logo.svg";
import { IconButton } from "../ui";
import { ConvertOutput } from "../encode";
import { ImageEncoder } from "../codecs";
import { Result } from "./index";
import ImageView from "./ImageView";
import Chart from "./Chart";
import ControlPanel from "./ControlPanel";
import style from "./AnalyzePage.scss";

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

interface AnalyzePageProps {
	result: Result;
	onStart: () => void;
}

export default function AnalyzePage(props: AnalyzePageProps) {
	const { result, onStart } = props;

	const [showChart, setShowChart] = useState(true);

	const [image, setImage] = useState<ImageData>(result.map.keys().next().value);
	const [series, setSeries] = useState<ConvertOutput[]>([]);
	const [output, setOutput] = useState<ConvertOutput>();

	const index = series.indexOf(output!);

	return (
		<>
			<ImageView {...result} optimized={output}/>

			{showChart && <Chart original={result.original} outputs={series} index={index}/>}

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
					onClick={onStart}
				>
					<UploadIcon/>
				</IconButton>
				<IconButton
					title="Show chart"
					className={style.iconButton}
					active={showChart}
					onClick={() => setShowChart(!showChart)}
				>
					<ChartIcon/>
				</IconButton>
				<DownloadButton
					title="Download compressed image"
					filename={result.original?.file.name}
					codec={WebP}
					buffer={output?.buffer}
				>
					<DownloadIcon/>
				</DownloadButton>
			</div>

			<ControlPanel
				result={result}
				onImageChange={setImage}
				onSeriesChange={setSeries}
				onOutputChange={setOutput}
			/>
		</>
	);
}
