import { Dispatch, useState } from "react";
import { MeasureOptions } from "../features/measurement";
import { InputImage } from "../features/image-worker";
import { Button, Dialog, TabList, TabSwitch } from "../ui";
import { useLocalStorage } from "../utils";
import ImageInfoPanel from "./ImageInfoPanel";
import MeasurePanel, { getMeasureOptions } from "./MeasurePanel";
import EncoderPanel, { EncodingOptions, getEncodingOptions } from "./EncoderPanel";
import styles from "./ConfigDialog.scss";

export interface AnalyzeConfig {
	encoding: EncodingOptions;
	measurement: MeasureOptions;
}

export interface ConfigDialogProps {
	image: InputImage;
	onStart: Dispatch<AnalyzeConfig>;
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
	const [measurement, setMeasurement] = useState(loadOptions("Measure", getMeasureOptions));

	function start() {
		onStart({ encoding, measurement });
		localStorage.setItem("Encoding", JSON.stringify(encoding));
		localStorage.setItem("Measure", JSON.stringify(measurement));
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
				<button className={styles.tab}>Information</button>
				<button className={styles.tab}>Encoding</button>
				<button className={styles.tab}>Measure</button>
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
					hasEncodePhase={true}
					value={measurement}
					onChange={setMeasurement}
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
