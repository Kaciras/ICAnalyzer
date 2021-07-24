import { ReactNode, useEffect, useMemo, useReducer, useRef, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { Button } from "../ui";
import { ENCODER_MAP, ENCODERS, ImageEncoder } from "../codecs";
import { AnalyzeResult } from "../analyzing";
import { AnalyzeContext, ControlsMap } from "./index";
import ImageView from "./ImageView";
import ChartPanel from "./ChartPanel";
import ControlPanel from "./ControlPanel";
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

export enum VariableType {
	None,
	Encoder,
	Option,
}

// TODO: name
type EncodeOptions = Record<string, any>;
type StateMap = Record<string, EncodeOptions>;

export interface EncodeConfig {
	encoder: string;
	options: Record<string, any>;
}

export interface ControlState {
	varType: VariableType;
	varName: string;
	encoderName: string;
	stateMap: StateMap;
}

function createControlState(controlsMap: ControlsMap): ControlState {
	let varType = VariableType.None;
	let varName = "";

	const kvs = Object.entries(controlsMap);
	if (kvs.length > 1) {
		varType = VariableType.Encoder;
		varName = "";
	}

	const [encoderName, controls] = kvs[0];
	if (controls.length > 0) {
		varType = VariableType.Option;
		varName = controls[0].id;
	}

	// encoder name -> option id -> values
	const stateMap: StateMap = {};
	for (const [k, v] of kvs) {
		const options: EncodeOptions = {};
		for (const c of v) {
			options[c.id] = c.createState()[0];
		}
		stateMap[k] = options;
	}

	return { varType, varName, encoderName, stateMap };
}

function updateControlState(state: ControlState, action: Partial<ControlState>) {
	return { ...state, ...action };
}

function getSeries(result: AnalyzeContext, state: ControlState) {
	const { controlsMap, outputMap } = result;
	const { varType, varName, encoderName, stateMap } = state;

	const key = stateMap[encoderName];
	const output = outputMap.get({ encoder: encoderName, key });

	let labels: string[];
	let series: AnalyzeResult[];
	let xLabel: string;

	if (varType === VariableType.None) {
		labels = [""];
		series = [output];
		xLabel = "";
	} else if (varType === VariableType.Encoder) {
		labels = ENCODERS.filter(e => e.name in stateMap).map(e => e.name);
		series = labels.map(encoder => outputMap.get({
			encoder,
			key: stateMap[encoder],
		}));
		xLabel = "Encoding";
	} else if (varType === VariableType.Option) {
		const control = controlsMap[encoderName].find(c => c.id === varName)!;
		const values = control.createState();

		labels = values.map(v => v.toString());
		series = values.map(v => outputMap.get({
			encoder: encoderName,
			key: { ...key, [varName]: v },
		}));
		xLabel = control.label;
	} else {
		throw new Error("Missing handle of variableType: " + varType);
	}

	return { output, labels, series, xLabel };
}

export interface AnalyzePageProps {
	result: AnalyzeContext;
	onStart: () => void;
	onClose: () => void;
}

export default function AnalyzePage(props: AnalyzePageProps) {
	const { result, onStart, onClose } = props;
	const { input, controlsMap, seriesMeta } = result;

	const [showChart, setShowChart] = useState(true);
	const [state, setState] = useReducer(updateControlState, controlsMap, createControlState);

	const { labels, series, output, xLabel } = useMemo(() => getSeries(result, state), [result, state]);

	const index = series.indexOf(output);
	if (index < 0) {
		throw new Error("Can't find current index in series");
	}

	return (
		<>
			<ImageView
				className={styles.imageView}
				original={input}
				output={output}
			/>

			<ChartPanel
				className={styles.metricsPanel}
				visible={showChart}
				seriesMeta={seriesMeta}
				index={index}
				xLabel={xLabel}
				values={labels}
				outputs={series}
			/>

			<div className={styles.buttonPanel}>
				<Button
					title="Back"
					type="text"
					className={styles.iconButton}
					onClick={onClose}
				>
					<CloseIcon/>
				</Button>
				<Button
					title="Try it again"
					type="text"
					className={styles.iconButton}
					onClick={onStart}
				>
					<UploadIcon/>
				</Button>
				<Button
					title="Show metrics"
					type="text"
					className={styles.iconButton}
					active={showChart}
					onClick={() => setShowChart(!showChart)}
				>
					<ChartIcon/>
				</Button>
				<DownloadButton
					title="Download output image"
					filename={input.file.name}
					codec={ENCODER_MAP[state.encoderName]}
					buffer={output.buffer}
				>
					<DownloadIcon/>
				</DownloadButton>
			</div>

			<ControlPanel value={state} onChange={setState} controlsMap={controlsMap}/>
		</>
	);
}
