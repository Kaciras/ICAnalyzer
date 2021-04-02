import { ReactNode, useEffect, useMemo, useReducer, useRef, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { Button } from "../ui";
import { ENCODER_MAP, ENCODERS, EncoderState, ImageEncoder } from "../codecs";
import { Result } from "./index";
import ImageView from "./ImageView";
import ChartPanel from "./ChartPanel";
import ControlPanel from "./ControlPanel";
import { EncodingConfig } from "./EncoderPanel";
import styles from "./AnalyzePage.scss";

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

	const url = useRef("");

	useEffect(() => () => URL.revokeObjectURL(url.current), []);

	function downloadImage() {
		const blob = new Blob([buffer], { type: mimeType });

		URL.revokeObjectURL(url.current);
		const newUrl = URL.createObjectURL(blob);
		url.current = newUrl;

		const a = document.createElement("a");
		a.href = newUrl;
		a.download = filename.replace(/.[^.]*$/, `.${extension}`);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	return (
		<Button
			className={styles.iconButton}
			type="text"
			title={title}
			onClick={downloadImage}
		>
			{children}
		</Button>
	);
}

export enum Step {
	None,
	Encoder,
	Options,
}

interface EncoderControlState extends EncoderState {
	labels: Record<string, string[]>;
}

export interface ControlState {
	encoderName: string;
	encoderState: Record<string, EncoderControlState>;

	variableType: Step;
	variableName: string;
}

function createTODOState(encoders: EncodingConfig): Record<string, EncoderControlState> {
	const rv: Record<string, EncoderControlState> = {};

	for (const [name, data] of Object.entries(encoders)) {
		if (!data.enable) {
			continue;
		}
		const s = ENCODER_MAP[name].initControlState(data.state);
		rv[name] = { ...data.state, ...s };
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
	const { original, config, outputMap } = result;

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

	function updateControlState(state: ControlState, action: Partial<ControlState>) {
		return { ...state, ...action };
	}

	const [showChart, setShowChart] = useState(true);
	const [state, setState] = useReducer(updateControlState, null, createControlState);

	const { variableType, variableName, encoderName, encoderState } = state;

	const encoder = ENCODER_MAP[encoderName];

	const [options] = encoder.getOptionsList({
		varNames: [],
		values: encoderState[encoderName].values,
		ranges: encoderState[encoderName].ranges,
	});

	const output = outputMap[JSON.stringify({ encoder: encoderName, options })];

	const [labels, series] = useMemo(() => {
		if (variableType === Step.Encoder) {
			const encodings = ENCODERS.filter(e => e.name in config.encoders);
			const s = encodings.map(e => {
				const [options] = e.getOptionsList({
					varNames: [],
					values: encoderState[e.name].values,
					ranges: encoderState[e.name].ranges,
				});
				return outputMap[JSON.stringify({ encoder: e.name, options })];
			});
			return [encodings.map(e => e.name), s];
		} else if (variableType === Step.Options) {
			const list = encoder.getOptionsList({
				varNames: [variableName],
				values: encoderState[encoderName].values,
				ranges: encoderState[encoderName].ranges,
			});

			const s = list.map(options => outputMap[JSON.stringify({ encoder: encoderName, options })]);
			const l = encoderState[encoderName].labels[variableName];
			return [l, s];
		} else {
			return [[""], [output]];
		}
	}, [options, result, variableType, variableName]);

	const index = series.indexOf(output);

	return (
		<>
			<ImageView original={original} output={output}/>

			<ChartPanel
				visible={showChart}
				original={original}
				index={index}
				values={labels}
				outputs={series}
			/>

			<div className={styles.buttonGroup}>
				<Button
					title="Back"
					type="text"
					className={styles.iconButton}
					onClick={onClose}
				>
					<CloseIcon/>
				</Button>
				<Button
					title="Select an image"
					type="text"
					className={styles.iconButton}
					onClick={onStart}
				>
					<UploadIcon/>
				</Button>
				<Button
					title="Show chart"
					type="text"
					className={styles.iconButton}
					active={showChart}
					onClick={() => setShowChart(!showChart)}
				>
					<ChartIcon/>
				</Button>
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
