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
import { AnalyzeConfig } from "./ConfigDialog";
import { EncodingConfig } from "./EncoderPanel";

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
	Encoder,
	Options,
}

export interface ControlState {
	encoderName: string;
	options: any;

	variableType: Step;
	variableName: string;
}

function createTODOState(config: AnalyzeConfig) {
	const rv: EncodingConfig = {};
	for (const [name, state] of Object.entries(config.encoders)) {
		const s = ENCODER_MAP[name].initControlState(state.state);
		rv[name] = { enable: state.enable, state: s };
	}
}

interface AnalyzePageProps {
	result: Result;
	onStart: () => void;
	onClose: () => void;
}

export default function AnalyzePage(props: AnalyzePageProps) {
	const { result, onStart, onClose } = props;
	const { original, config, map } = result;

	function createControlState(): ControlState {
		const { encoders } = config;
		let variableType = Step.None;
		let variableName = "";

		const kvs = Object.entries(encoders).filter(e => e[1].enable);
		if (kvs.length > 1) {
			variableType = Step.Encoder;
			variableName = "";
		}

		const [encoderName, state] = kvs[0];
		if (state.state.varNames.length > 0) {
			variableType = Step.Options;
			variableName = state.state.varNames[0];
		}

		const options = ENCODER_MAP[encoderName].getOptionsList({
			varNames: [],
			data: state.state.data,
		});

		return { variableType, variableName, encoderName, options };
	}

	const [showChart, setShowChart] = useState(true);
	const [state, setState] = useState(createControlState);

	const { variableType, variableName, encoderName } = state;
	const options = state.options[0];

	const output = map[encoderName][JSON.stringify(options)];
	const encoder = ENCODER_MAP[encoderName];

	let series: ConvertOutput[];
	if (variableType === Step.Encoder) {
		const optKey = JSON.stringify(options);
		series = Array.from(Object.values(map)).map(e => e[optKey]);
	} else if (variableType === Step.Options) {
		const x = map[encoderName];
		const list = encoder.getOptionsList({
			varNames: [variableName],
			data: config.encoders[encoderName].state.data,
		});
		series = list.map(options => x[JSON.stringify(options)]);
	} else {
		series = [output]; // TODO: bar chart
	}

	const index = series.indexOf(output);

	return (
		<>
			<ImageView original={original} optimized={output}/>

			{showChart && <Chart original={original} outputs={series} index={index}/>}

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
					filename={original.file.name}
					codec={encoder}
					buffer={output.buffer}
				>
					<DownloadIcon/>
				</DownloadButton>
			</div>

			<ControlPanel value={state} onChange={setState} config={config}/>
		</>
	);
}
