import { ReactNode, useEffect, useMemo, useReducer, useRef, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { Button } from "../ui";
import { OptionsKey } from "../form";
import { ENCODER_MAP, getEncoderNames, ImageEncoder } from "../codecs";
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

type StateMap = Record<string, OptionsKey>;

export interface ControlState {
	varType: VariableType;
	varId: string;
	codec: string;
	stateMap: StateMap;
}

function createControlState(controlsMap: ControlsMap): ControlState {
	let varType = VariableType.None;
	let varId = "";

	const kvs = Object.entries(controlsMap);
	if (kvs.length > 1) {
		varType = VariableType.Encoder;
		varId = "";
	}

	const [codec, controls] = kvs[0];
	if (controls.length > 0) {
		varType = VariableType.Option;
		varId = controls[0].id;
	}

	// codec -> option id -> values
	const stateMap: StateMap = {};
	for (const [k, v] of kvs) {
		const options: OptionsKey = {};
		for (const c of v) {
			options[c.id] = c.createState()[0];
		}
		stateMap[k] = options;
	}

	return { varType, varId, codec, stateMap };
}

function updateControlState(state: ControlState, action: Partial<ControlState>) {
	return { ...state, ...action };
}

function getSeries(result: AnalyzeContext, state: ControlState) {
	const { controlsMap, outputMap } = result;
	const { varType, varId, codec, stateMap } = state;

	const key = stateMap[codec];
	const output = outputMap.get({ codec, key });

	let labels: string[];
	let series: AnalyzeResult[];
	let varName: string;

	if (varType === VariableType.None) {
		labels = [""];
		series = [output];
		varName = "";
	} else if (varType === VariableType.Encoder) {
		labels = getEncoderNames(stateMap);
		series = labels.map(codec => outputMap.get({
			codec,
			key: stateMap[codec],
		}));
		varName = "Encoding";
	} else if (varType === VariableType.Option) {
		const control = controlsMap[codec].find(c => c.id === varId)!;
		const values = control.createState();

		labels = values.map(v => v.toString());
		series = values.map(v => outputMap.get({
			codec,
			key: { ...key, [varId]: v },
		}));
		varName = control.label;
	} else {
		throw new Error("Missing handle of variable type: " + varType);
	}

	return { output, labels, series, varName };
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

	const { labels, series, output, varName } = useMemo(() => getSeries(result, state), [result, state]);

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
				xLabel={varName}
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
					codec={ENCODER_MAP[state.codec]}
					buffer={output.buffer}
				>
					<DownloadIcon/>
				</DownloadButton>
			</div>

			<ControlPanel value={state} onChange={setState} controlsMap={controlsMap}/>
		</>
	);
}
