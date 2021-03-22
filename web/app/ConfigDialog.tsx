import { useState } from "react";
import clsx from "clsx";
import { MeasureOptions } from "../encode";
import { Button, Dialog } from "../ui";
import ImageInfoPanel from "./ImageInfoPanel";
import MetricsPanel, { createMeansureState } from "./MetricsPanel";
import EncoderPanel, { createEncodingConfig, EncodingConfig } from "./EncoderPanel";
import styles from "./ConfigDialog.scss";

export interface AnalyzeConfig {
	encoders: EncodingConfig;
	measure: MeasureOptions;
}

function initEncoderConfig(): AnalyzeConfig {
	const saved = localStorage.getItem("Config");
	if (saved) {
		return JSON.parse(saved);
	}
	return {
		encoders: createEncodingConfig(),
		measure: createMeansureState(),
	};
}

interface ConfigDialogProps {
	image: ImageData;
	file: File;
	onStart: (config: AnalyzeConfig) => void;
	onClose: () => void;
	onSelectFile: () => void;
}

const panels = ["Information", "Encoding", "Measure"];

export default function ConfigDialog(props: ConfigDialogProps) {
	const { file, image, onStart, onClose, onSelectFile } = props;

	const [index, setIndex] = useState(0);
	const [data, setData] = useState(initEncoderConfig);

	function start() {
		onStart(data);
		localStorage.setItem("Config", JSON.stringify(data));
	}

	const tabs = panels.map((name, i) =>
		<div
			className={styles.tab}
			key={i}
			role="tab"
			aria-selected={i === index}
			onClick={() => setIndex(i)}
		>
			{name}
		</div>);

	let panel;

	switch (index) {
		case 0:
			panel = <ImageInfoPanel
				file={file}
				image={image}
			/>;
			break;
		case 1:
			panel = <EncoderPanel
				value={data.encoders}
				onChange={v => setData({ ...data, encoders: v })}
			/>;
			break;
		case 2:
			panel = <MetricsPanel
				value={data.measure}
				onChange={v => setData({ ...data, measure: v })}
			/>;
			break;
	}

	const ready = file && Object.values(data.encoders).some(e => e.enable);

	return (
		<Dialog
			name="Analysis config"
			className={styles.dialog}
			onClose={onClose}
		>
			<div className={styles.header} role="tablist">{tabs}</div>
			{panel}
			<div className="dialog-actions">
				<Button onClick={onSelectFile}>Select file...</Button>
				<Button color="second" onClick={onClose}>Cancel</Button>
				<Button disabled={!ready} onClick={start}>Start</Button>
			</div>
		</Dialog>
	);
}
