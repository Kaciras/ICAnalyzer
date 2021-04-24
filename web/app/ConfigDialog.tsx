import { useState } from "react";
import { MeasureOptions } from "../encode";
import { Button, Dialog } from "../ui";
import { InputImage } from "./index";
import ImageInfoPanel from "./ImageInfoPanel";
import MetricsPanel, { createMeasureState } from "./MetricsPanel";
import EncoderPanel, { createEncodingConfig, EncodingConfig } from "./EncoderPanel";
import styles from "./ConfigDialog.scss";

export interface AnalyzeConfig {
	measure: MeasureOptions;
	encoding: EncodingConfig;
}

export interface ConfigDialogProps {
	image: InputImage;
	onStart: (config: AnalyzeConfig) => void;
	onClose: () => void;
	onSelectFile: () => void;
}

const panels = ["Information", "Encoding", "Measure"];

export default function ConfigDialog(props: ConfigDialogProps) {
	const { image, onStart, onClose, onSelectFile } = props;

	const [index, setIndex] = useState(0);
	const [encoding, setEncoding] = useState(createEncodingConfig);
	const [measure, setMeasure] = useState(createMeasureState);

	function start() {
		onStart({ encoding, measure });
		localStorage.setItem("EncodingConfig", JSON.stringify(encoding));
		localStorage.setItem("MeasureConfig", JSON.stringify(measure));
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
				value={encoding}
				onChange={setEncoding}
			/>;
			break;
		case 2:
			panel = <MetricsPanel
				value={measure}
				encodeTime={true}
				onChange={setMeasure}
			/>;
			break;
	}

	const ready = image && Object.values(encoding).some(e => e.enable);

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
