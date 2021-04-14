import { ReactNode, useEffect, useMemo, useReducer, useRef, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { Button } from "../ui";
import { ENCODER_MAP, ENCODERS, ImageEncoder } from "../codecs";
import { Result } from "./index";
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

interface AnalyzePageProps {
	result: Result;
	onStart: () => void;
	onClose: () => void;
}

export default function AnalyzePage(props: AnalyzePageProps) {
	const { result, onStart, onClose } = props;
	const { input, config, outputMap } = result;

	function createControlState(): ControlState {
		const { controlsMap } = config;
		let variableType = Step.None;
		let variableName = "";

		const kvs = Object.entries(controlsMap);
		if (kvs.length > 1) {
			variableType = Step.Encoder;
			variableName = "";
		}

		// encoder name -> option id -> values
		const encoderState: Record<string, Record<string, any>> = {};
		for (const [k, v] of kvs) {
			encoderState[k] = Object.fromEntries(v.map(c => [c.id, c.createState()[0]]));
		}

		const [encoderName, controls] = kvs[0];
		if (controls.length > 0) {
			variableType = Step.Options;
			variableName = controls[0].id;
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
	const key = encoderState[encoderName];

	const output = outputMap.get({ encoder: encoderName, key });

	const [labels, series] = useMemo(() => {
		if (variableType === Step.Encoder) {
			const encodings = ENCODERS.filter(e => e.name in encoderState);
			const s = encodings.map(e => {
				const key = encoderState[e.name];

				return outputMap.get({ encoder: e.name, key });
			});
			return [encodings.map(e => e.name), s];
		} else if (variableType === Step.Options) {
			const control = config.controlsMap[encoderName].find(c => c.id === variableName);
			const allValues = control!.createState();
			const s = allValues.map(v => outputMap
				.get({ encoder: encoderName, key: { ...key, [variableName]: v } }));

			return [allValues.map(v => v.toString()), s];
		} else {
			return [[""], [output]];
		}
	}, [key, result, variableType, variableName]);

	const index = series.indexOf(output);

	return (
		<>
			<ImageView original={input} output={output}/>

			<ChartPanel
				visible={showChart}
				original={input}
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
					filename={input.file.name}
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
