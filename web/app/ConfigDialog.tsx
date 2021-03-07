import { useState } from "react";
import clsx from "clsx";
import { MeasureOptions } from "../encode";
import { Button, Dialog } from "../ui";
import ImageInfoPanel from "./ImageInfoPanel";
import MetricsPanel from "./MetricsPanel";
import Styles from "./ConfigDialog.scss";
import EncoderPanel, { EncodeConfig } from "./EncoderPanel";
import PreprocessPanel, { PreprocessConfig } from "./PreprocessPanel";

export interface AnalyzeConfig {
	preprocess: PreprocessConfig;
	encode: EncodeConfig;
	threads: number;
	measure: MeasureOptions;
}

interface Props {
	image: ImageData;
	file: File;
	onStart: (config: AnalyzeConfig) => void;
	onClose: () => void;
	onSelectFile: () => void;
}

export default function ConfigDialog(props: Props) {
	const { file, image, onStart, onClose, onSelectFile } = props;

	const [encodeConfig, setEncodeConfig] = useState<any>({});
	const [preprocessConfig, setPreprocessConfig] = useState<any>({});

	const [workerCount, setWorkerCount] = useState(navigator.hardwareConcurrency);

	const [measure, setMeasure] = useState<MeasureOptions>({
		time: false,
		SSIM: false,
		PSNR: true,
		butteraugli: false,
	});

	function start() {
		onStart({ encode: encodeConfig, preprocess: {}, measure, threads: workerCount });
	}

	const [index, setIndex] = useState(0);

	const panels = ["Information", "Preprocess", "Encoders", "Measure"];

	const tabs = [];
	for (let i = 0; i < panels.length; i++) {
		const name = panels[i];
		const clazz = i === index ? clsx(Styles.tab, Styles.active) : Styles.tab;
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
			panel = <EncoderPanel value={encodeConfig} onChange={setEncodeConfig}/>;
			break;
		case 3:
			panel = <MetricsPanel
				workerCount={workerCount}
				options={measure}
				onWorkerCountChange={setWorkerCount}
				onMeasureChange={setMeasure}
			/>;
			break;
		default:
			throw new Error();
	}

	const ready = file && Object.keys(encodeConfig).length;

	return (
		<Dialog className={Styles.dialog} onClose={onClose}>
			<div className={Styles.header}>{tabs}</div>
			{panel}
			<div className="dialog-actions">
				<Button onClick={onSelectFile}>Select file...</Button>
				<Button color="second" onClick={onClose}>Cancel</Button>
				<Button disabled={!ready} onClick={start}>Start</Button>
			</div>
		</Dialog>
	);
}
