import { useMemo, useState } from "react";
import { TbChartHistogram, TbDownload, TbUpload, TbX } from "react-icons/tb";
import { Button, DownloadButton } from "../ui/index.ts";
import { AnalyzeContext, ControlsMap } from "./index";
import { ControlType } from "../form/index.ts";
import { getEncoderNames } from "../codecs/index.ts";
import { getMerger } from "../mutation.ts";
import { MetricMeta } from "../features/measurement.tsx";
import ImageView from "./ImageView.tsx";
import ChartPanel from "./ChartPanel.tsx";
import ControlPanel from "./ControlPanel.tsx";
import { AnalyzeResult } from "../features/image-worker.tsx";
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
		const value = metrics[key].toFixed(3);
		items.push(<dt key={name}>{name}:</dt>);
		items.push(<dd key={key}>{value}</dd>);
	}

	return <dl className={styles.simple}>{items}</dl>;
}

export enum VariableType {
	None,
	Encoder,
	Option,
}

type StateMap = Record<string, any[]>;

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
	for (const [enc, v] of kvs) {
		const selected = [];
		for (const c of v) {
			selected.push(c.createState()[0]);
		}
		stateMap[enc] = selected;
	}

	return { varType, varId, codec, stateMap };
}

function getIndex(controls: ControlType[], weights: number[], state: any[]) {
	let index = 0;
	for (let i = 0; i < controls.length; i++) {
		const control = controls[i];
		const k = control.indexOf(state[i]);
		index += weights[i] * k;
	}
	return index;
}

function getSeries(result: AnalyzeContext, state: ControlState) {
	const { controlsMap, offsetMap, outputs, weightMap } = result;
	const { varType, varId, codec, stateMap } = state;

	let labels: string[];
	let series: AnalyzeResult[];
	let output: AnalyzeResult;
	let varName: string;

	if (varType === VariableType.None) {
		labels = [""];
		series = outputs;
		varName = "";
		output = series[0];
	} else if (varType === VariableType.Encoder) {
		labels = getEncoderNames(stateMap);
		series = labels.map(v => {
			const offset = offsetMap.get(v)!;
			const controls = controlsMap[v];
			const state = stateMap[v];
			const weights = weightMap.get(v)!;
			return outputs[offset + getIndex(controls, weights, state)];
		});
		output = series[labels.indexOf(codec)];
		varName = "Encoding";
	} else if (varType === VariableType.Option) {
		const controls = controlsMap[codec];
		const i = controls.findIndex(c => c.id === varId)!;
		const values = controls[i].createState();

		const state = stateMap[codec];
		const weights = weightMap.get(codec)!;
		const offset = offsetMap.get(codec)!;

		const w = weights[i];
		const c = offset + getIndex(controls, weights, state);
		const base = c - controls[i].indexOf(state[i]) * w;

		labels = values.map(v => v.toString());
		output = outputs[c];
		series = values.map((_, i) => outputs[base + w * i]);
		varName = controls[i].label;
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
	const [state, setState] = useState(() => createControlState(controlsMap));

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
				result.outputs.length === 1 ?
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
					<TbX/>
				</Button>
				<Button
					title="Try it again"
					type="text"
					className={styles.iconButton}
					onClick={onStart}
				>
					<TbUpload/>
				</Button>
				<Button
					title="Show metrics"
					type="text"
					className={styles.iconButton}
					active={showChart}
					onClick={() => setShowChart(!showChart)}
				>
					<TbChartHistogram/>
				</Button>
				<DownloadButton
					title="Download output image"
					type="text"
					className={styles.iconButton}
					file={output.file}
				>
					<TbDownload/>
				</DownloadButton>
			</div>

			<ControlPanel
				controlsMap={controlsMap}
				value={state}
				onChange={getMerger(setState)}
			/>
		</>
	);
}
