import { ReactNode, useEffect, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { IconButton } from "../ui";
import { ConvertOutput } from "../encode";
import { ENCODER_MAP, ImageEncoder } from "../codecs";
import { Result } from "./index";
import ImageView from "./ImageView";
import Chart from "./Chart";
import ControlPanel from "./ControlPanel";
import style from "./AnalyzePage.scss";

interface DownloadButtonProps {
	title?: string;
	buffer: ArrayBuffer;
	filename: string;
	codec: ImageEncoder;
	children: ReactNode;
}

function DownloadButton(props: DownloadButtonProps) {
	const { title, buffer, filename, children } = props;
	const { mimeType, extension } = props.codec;

	const [url, setUrl] = useState("");
	useEffect(() => () => URL.revokeObjectURL(url), []);

	function downloadImage() {
		const blob = new Blob([buffer], { type: mimeType });

		URL.revokeObjectURL(url);
		const newUrl = URL.createObjectURL(blob);
		setUrl(newUrl);

		const a = document.createElement("a");
		a.href = newUrl;
		a.download = filename.replace(/.[^.]*$/, `.${extension}`);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	return (
		<IconButton
			className={style.iconButton}
			title={title}
			onClick={downloadImage}
		>
			{children}
		</IconButton>
	);
}

export enum Step {
	None,
	Preprocess,
	Encoder,
	Options,
}

export interface ControlState {
	// preprocess config;
	encoderName: string;
	options: any;

	variableType: Step;
	variableName: string;
}

interface AnalyzePageProps {
	result: Result;
	onStart: () => void;
	onClose: () => void;
}

export default function AnalyzePage(props: AnalyzePageProps) {
	const { result, onStart, onClose } = props;

	function createControlState(): ControlState {
		const { encode } = result.config;
		let variableType = Step.None;
		let variableName = "";

		const kvs = Object.entries(encode);
		if (kvs.length > 1) {
			variableType = Step.Encoder;
			variableName = "";
		}

		const [encoderName, state] = kvs[0];
		if (state.varNames.length > 0) {
			variableType = Step.Options;
			variableName = state.varNames[0];
		}

		const options = ENCODER_MAP[encoderName].getOptionsList({
			varNames: [],
			data: state.data,
		});

		return { variableType, variableName, encoderName, options };
	}

	const [showChart, setShowChart] = useState(true);
	const [state, setState] = useState(createControlState);

	const { variableType, variableName, encoderName, options } = state;
	const image = result.original.data;

	const output = result.map.get(image)!.get(encoderName)!.get(JSON.stringify(options))!;
	const encoder = ENCODER_MAP[encoderName];

	let series: ConvertOutput[];
	if (variableType === Step.None) {
		series = [output]; // TODO: bar chart
	} else if (variableType === Step.Encoder) {
		const x = result.map.get(image)!;
		series = Array.from(x.values()).map(e => e.get(JSON.stringify(options))!);
	} else {
		const x = result.map.get(image)!.get(encoderName)!;
		const list = encoder.getOptionsList({
			varNames: [variableName],
			data: result.config.encode[encoderName].data,
		});
		series = list.map(options => x.get(JSON.stringify(options))!);
	}

	const index = series.indexOf(output);

	return (
		<>
			<ImageView {...result} optimized={output}/>

			{showChart && <Chart original={result.original} outputs={series} index={index}/>}

			<div className={style.buttonGroup}>
				<IconButton
					title="Back"
					className={style.iconButton}
					onClick={onClose}
				>
					<CloseIcon/>
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
					filename={result.original.file.name}
					codec={encoder}
					buffer={output.buffer}
				>
					<DownloadIcon/>
				</DownloadButton>
			</div>

			<ControlPanel value={state} onChange={setState} config={result.config}/>
		</>
	);
}
