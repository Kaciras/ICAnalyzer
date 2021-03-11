import { useState } from "react";
import clsx from "clsx";
import { MeasureOptions } from "../encode";
import { Button, Dialog } from "../ui";
import ImageInfoPanel from "./ImageInfoPanel";
import MetricsPanel from "./MetricsPanel";
import EncoderPanel, { StateMap } from "./EncoderPanel";
import PreprocessPanel, { PreprocessConfig } from "./PreprocessPanel";
import styles from "./ConfigDialog.scss";

export interface AnalyzeConfig {
	preprocess: PreprocessConfig;
	encode: StateMap;
	threads: number;
	measure: MeasureOptions;
}

interface ConfigDialogProps {
	image: ImageData;
	file: File;
	onStart: (config: AnalyzeConfig) => void;
	onClose: () => void;
	onSelectFile: () => void;
}

const panels = ["Information", "Preprocess", "Encoding", "Measure"];

export default function ConfigDialog(props: ConfigDialogProps) {
	const { file, image, onStart, onClose, onSelectFile } = props;

	const [index, setIndex] = useState(0);

	const [preprocessConfig, setPreprocessConfig] = useState<any>({});
	const [stateMap, setStateMap] = useState<any>({});

	const [workerCount, setWorkerCount] = useState(navigator.hardwareConcurrency);

	const [measure, setMeasure] = useState<MeasureOptions>({
		time: false,
		SSIM: false,
		PSNR: true,
		butteraugli: false,
	});

	function start() {
		onStart({ encode: stateMap, preprocess: {}, measure, threads: workerCount });
	}

	const tabs = [];
	for (let i = 0; i < panels.length; i++) {
		const name = panels[i];
		const clazz = i === index ? clsx(styles.tab, styles.active) : styles.tab;
		tabs.push(<div key={i} className={clazz} onClick={() => setIndex(i)}>{name}</div>);
	}

	let panel;

	switch (index) {
		case 0:
			panel = <ImageInfoPanel
				file={file}
				image={image}
			/>;
			break;
		case 1:
			panel = <PreprocessPanel onChange={setPreprocessConfig}/>;
			break;
		case 2:
			panel = <EncoderPanel value={stateMap} onChange={setStateMap}/>;
			break;
		case 3:
			panel = <MetricsPanel
				workerCount={workerCount}
				options={measure}
				onWorkerCountChange={setWorkerCount}
				onMeasureChange={setMeasure}
			/>;
			break;
	}

	const ready = file && Object.keys(stateMap).length;

	return (
		<Dialog className={styles.dialog} onClose={onClose}>
			<div className={styles.header}>{tabs}</div>
			{panel}
			<div className="dialog-actions">
				<Button onClick={onSelectFile}>Select file...</Button>
				<Button color="second" onClick={onClose}>Cancel</Button>
				<Button disabled={!ready} onClick={start}>Start</Button>
			</div>
		</Dialog>
	);
}
