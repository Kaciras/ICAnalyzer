import { useState } from "react";
import { MeasureOptions } from "../analyzing";
import { Button, Dialog, TabList, TabSwitch } from "../ui";
import { InputImage } from "./index";
import ImageInfoPanel from "./ImageInfoPanel";
import MeasurePanel, { getMeasureOptions } from "./MeasurePanel";
import EncoderPanel, { EncodingOptions, getEncodingOptions } from "./EncoderPanel";
import styles from "./ConfigDialog.scss";

export interface AnalyzeConfig {
	measure: MeasureOptions;
	encoding: EncodingOptions;
}

export interface ConfigDialogProps {
	image: InputImage;
	onStart: (config: AnalyzeConfig) => void;
	onClose: () => void;
	onSelectFile: () => void;
}

function loadOptions<T>(key: string, processor: (saved?: T) => T) {
	return () => {
		const saved = localStorage.getItem(key);
		return processor(saved ? JSON.parse(saved) : undefined);
	};
}

export default function ConfigDialog(props: ConfigDialogProps) {
	const { image, onStart, onClose, onSelectFile } = props;

	const [index, setIndex] = useState(0);
	const [encoding, setEncoding] = useState(loadOptions("Encoding", getEncodingOptions));
	const [measure, setMeasure] = useState(loadOptions("Measure", getMeasureOptions));

	function start() {
		onStart({ encoding, measure });
		localStorage.setItem("Encoding", JSON.stringify(encoding));
		localStorage.setItem("Measure", JSON.stringify(measure));
	}

	const ready = image && Object.values(encoding).some(e => e.enable);

	return (
		<Dialog
			name="Analysis config"
			className={styles.dialog}
			onClose={onClose}
		>
			<TabList
				className={styles.header}
				index={index}
				onChange={setIndex}
			>
				<div className={styles.tab}>Information</div>
				<div className={styles.tab}>Encoding</div>
				<div className={styles.tab}>Measure</div>
			</TabList>

			<TabSwitch index={index}>
				<ImageInfoPanel
					value={image}
				/>
				<EncoderPanel
					value={encoding}
					onChange={setEncoding}
				/>
				<MeasurePanel
					value={measure}
					encodeTime={true}
					onChange={setMeasure}
				/>
			</TabSwitch>

			<div className="dialog-actions">
				<Button onClick={onSelectFile}>Select file...</Button>
				<Button className="second" onClick={onClose}>Cancel</Button>
				<Button disabled={!ready} onClick={start}>Start</Button>
			</div>
		</Dialog>
	);
}
