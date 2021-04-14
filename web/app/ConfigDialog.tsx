import { useState } from "react";
import { MeasureOptions } from "../encode";
import { Button, Dialog } from "../ui";
import { InputImage } from "./index";
import ImageInfoPanel from "./ImageInfoPanel";
import MetricsPanel, { createMeasureState } from "./MetricsPanel";
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
		measure: createMeasureState(),
	};
}

interface ConfigDialogProps {
	image: InputImage;
	onStart: (config: AnalyzeConfig) => void;
	onClose: () => void;
	onSelectFile: () => void;
}

const panels = ["Information", "Encoding", "Measure"];

export default function ConfigDialog(props: ConfigDialogProps) {
	const { image, onStart, onClose, onSelectFile } = props;

	const [index, setIndex] = useState(0);
	const [config, setConfig] = useState(initEncoderConfig);

	function start() {
		onStart(config);
		localStorage.setItem("Config", JSON.stringify(config));
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
			panel = <ImageInfoPanel value={image}/>;
			break;
		case 1:
			panel = <EncoderPanel
				value={config.encoders}
				onChange={v => setConfig({ ...config, encoders: v })}
			/>;
			break;
		case 2:
			panel = <MetricsPanel
				value={config.measure}
				onChange={v => setConfig({ ...config, measure: v })}
			/>;
			break;
	}

	const ready = image && Object.values(config.encoders).some(e => e.enable);

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
				<Button className="second" onClick={onClose}>Cancel</Button>
				<Button disabled={!ready} onClick={start}>Start</Button>
			</div>
		</Dialog>
	);
}
