import { Dispatch, useState } from "react";
import { MeasureOptions } from "../features/measurement.ts";
import { InputImage } from "../features/image-worker.ts";
import { getMerger, useLocalStorage } from "../hooks.ts";
import { Button, Dialog, TabList, TabSwitch } from "../ui/index.ts";
import ImageInfoPanel from "./ImageInfoPanel.tsx";
import MeasurePanel, { getMeasureOptions } from "./MeasurePanel.tsx";
import EncoderPanel, { EncodingOptions, getEncodingOptions } from "./EncoderPanel.tsx";
import styles from "./CompressConfigDialog.scss";
import i18n from "../i18n.ts";

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

	function start() {
		onStart({ encoding, measurement });
	}

	const ready = image && Object.values(encoding).some(e => e.enable);

	return (
		<Dialog
			name={i18n("AnalysisConfig")}
			className={styles.dialog}
			onClose={onClose}
		>
			<TabList
				className={styles.header}
				index={index}
				onChange={setIndex}
			>
				<button type="button" className={styles.tab}>{i18n("Information")}</button>
				<button type="button" className={styles.tab}>{i18n("Encoders")}</button>
				<button type="button" className={styles.tab}>{i18n("Analysis")}</button>
			</TabList>

			<TabSwitch index={index}>
				<ImageInfoPanel
					value={image}
				/>
				<EncoderPanel
					value={encoding}
					onChange={getMerger(setEncoding)}
				/>
				<MeasurePanel
					hasEncodePhase={true}
					value={measurement}
					onChange={setMeasurement}
				/>
			</TabSwitch>

			<div className="dialog-actions">
				<Button onClick={onSelectFile}>{i18n("SelectFile")}...</Button>
				<Button className="second" onClick={onClose}>{i18n("Cancel")}</Button>
				<Button disabled={!ready} onClick={start}>{i18n("Start")}</Button>
			</div>
		</Dialog>
	);
}
