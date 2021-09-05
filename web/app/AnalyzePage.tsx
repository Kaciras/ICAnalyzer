import { useMemo, useReducer, useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import DownloadIcon from "bootstrap-icons/icons/download.svg";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { Button, DownloadButton } from "../ui";
import { OptionsKey } from "../form";
import { getEncoderNames } from "../codecs";
import { AnalyzeResult } from "../features/image-worker";
import { MetricMeta } from "../features/measurement";
import { AnalyzeContext, ControlsMap } from "./index";
import ImageView from "./ImageView";
import ChartPanel from "./ChartPanel";
import ControlPanel from "./ControlPanel";
import styles from "./AnalyzePage.scss";

interface SimplePanelProps {
	visible: boolean;
	metas: MetricMeta[];
	metrics: Record<string, number>;
}

function SimplePanel(props: SimplePanelProps) {
	const { visible, metas, metrics } = props;

	if (!visible) {
		return null;
	}

	const items = [];
	for (const { key, name } of metas) {
		items.push(<dt>{name}:</dt>);
		items.push(<dd>{metrics[key].toFixed(3)}</dd>);
	}

	return <dl className={styles.simpleMetrics}>{items}</dl>;
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

			{
				result.outputMap.size === 1 ?
					<SimplePanel
						visible={showChart}
						metas={seriesMeta}
						metrics={output.metrics}
					/>
					:
					<ChartPanel
						className={styles.metricsPanel}
						visible={showChart}
						seriesMeta={seriesMeta}
						index={index}
						xLabel={varName}
						values={labels}
						outputs={series}
					/>
			}

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
					type="text"
					className={styles.iconButton}
					file={output.file}
				>
					<DownloadIcon/>
				</DownloadButton>
			</div>

			<ControlPanel value={state} onChange={setState} controlsMap={controlsMap}/>
		</>
	);
}
