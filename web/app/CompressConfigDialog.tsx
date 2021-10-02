import { Dispatch, useState } from "react";
import { MeasureOptions } from "../features/measurement";
import { InputImage } from "../features/image-worker";
import { Button, Dialog, TabList, TabSwitch } from "../ui";
import { useLocalStorage } from "../utils";
import ImageInfoPanel from "./ImageInfoPanel";
import MeasurePanel, { getMeasureOptions } from "./MeasurePanel";
import EncoderPanel, { EncodingOptions, getEncodingOptions } from "./EncoderPanel";
import styles from "./CompressConfigDialog.scss";
import { setupMerger } from "../mutation";

export interface AnalyzeConfig {
	encoding: EncodingOptions;
	measurement: MeasureOptions;
}

export interface CompressConfigDialogProps {
	image: InputImage;
	onStart: Dispatch<AnalyzeConfig>;
	onClose: () => void;
	onSelectFile: () => void;
}

export default function CompressConfigDialog(props: CompressConfigDialogProps) {
	const { image, onStart, onClose, onSelectFile } = props;

	const [index, setIndex] = useState(0);
	const [encoding, setEncoding] = useLocalStorage("Encoding", getEncodingOptions);
	const [measurement, setMeasurement] = useLocalStorage("Measure", getMeasureOptions);

	setupMerger(setEncoding);

	function start() {
		onStart({ encoding, measurement });
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
