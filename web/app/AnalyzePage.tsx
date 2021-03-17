import { ReactNode, useEffect, useMemo, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { IconButton } from "../ui";
import { ENCODER_MAP, EncoderState, ImageEncoder } from "../codecs";
import { Result } from "./index";
import ImageView from "./ImageView";
import Chart from "./Chart";
import ControlPanel from "./ControlPanel";
import style from "./AnalyzePage.scss";
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
	encoderState: Record<string, EncoderState>;

	variableType: Step;
	variableName: string;
}

function createTODOState(encoders: EncodingConfig): Record<string, EncoderState> {
	const rv: Record<string, EncoderState> = {};

	for (const [name, data] of Object.entries(encoders)) {
		if (!data.enable) {
			continue;
		}
		const values = ENCODER_MAP[name].initControlState(data.state);
		rv[name] = { ...data.state, values };
	}

	return rv;
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

		const encoderState = createTODOState(encoders);

		const [encoderName, state] = kvs[0];
		if (state.state.varNames.length > 0) {
			variableType = Step.Options;
			variableName = state.state.varNames[0];
		}

		return { variableType, variableName, encoderName, encoderState };
	}

	const [showChart, setShowChart] = useState(true);
	const [state, setState] = useState(createControlState);

	const { variableType, variableName, encoderName, encoderState } = state;

	const encoder = ENCODER_MAP[encoderName];

	const [options] = encoder.getOptionsList({
		varNames: [],
		values: encoderState[encoderName].values,
		ranges: encoderState[encoderName].ranges,
	});

	const output = map[encoderName][JSON.stringify(options)];

	const series = useMemo(() => {
		if (variableType === Step.Encoder) {
			const optKey = JSON.stringify(options);
			return Array.from(Object.values(map)).map(e => e[optKey]);
		} else if (variableType === Step.Options) {
			const x = map[encoderName];
			const list = encoder.getOptionsList({
				varNames: [variableName],
				values: encoderState[encoderName].values,
				ranges: encoderState[encoderName].ranges,
			});
			return list.map(op => x[JSON.stringify(op)]);
		} else {
			return [output]; // TODO: bar chart
		}
	}, [encoderName, variableType, variableName]);

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
