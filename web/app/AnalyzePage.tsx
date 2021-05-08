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

export enum Step {
	None,
	Encoder,
	Options,
}

export interface ControlState {
	encoderName: string;
	encoderState: Record<string, Record<string, any>>;

	variableType: Step;
	variableName: string;
}

function createControlState(controlsMap: ControlsMap): ControlState {
	let variableType = Step.None;
	let variableName = "";

	const kvs = Object.entries(controlsMap);
	if (kvs.length > 1) {
		variableType = Step.Encoder;
		variableName = "";
	}

	const [encoderName, controls] = kvs[0];
	if (controls.length > 0) {
		variableType = Step.Options;
		variableName = controls[0].id;
	}

	// encoder name -> option id -> values
	const encoderState: Record<string, Record<string, any>> = {};
	for (const [k, v] of kvs) {
		encoderState[k] = Object.fromEntries(v.map(c => [c.id, c.createState()[0]]));
	}

	return { variableType, variableName, encoderName, encoderState };
}

function updateControlState(state: ControlState, action: Partial<ControlState>) {
	return { ...state, ...action };
}

function getSeries(result: AnalyzeContext, state: ControlState) {
	const { controlsMap, outputMap } = result;
	const { variableType, variableName, encoderName, encoderState } = state;

	const key = encoderState[encoderName];
	const output = outputMap.get({ encoder: encoderName, key });

	let labels: string[];
	let series: AnalyzeResult[];

	if (variableType === Step.None) {
		labels = [""];
		series = [output];
	} else if (variableType === Step.Encoder) {
		labels = ENCODERS.filter(e => e.name in encoderState).map(e => e.name);
		series = labels.map(encoder => outputMap.get({
			encoder,
			key: encoderState[encoder],
		}));
	} else if (variableType === Step.Options) {
		const values = controlsMap[encoderName]
			.find(c => c.id === variableName)!.createState();

		labels = values.map(v => v.toString());
		series = values.map(v => outputMap.get({
			encoder: encoderName,
			key: { ...key, [variableName]: v },
		}));
	} else {
		throw new Error("Missing handle of variableType: " + variableType);
	}

	return { output, labels, series };
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

	const { labels, series, output } = useMemo(() => getSeries(result, state), [result, state]);

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
