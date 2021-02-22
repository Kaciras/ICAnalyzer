import { useState } from "react";
import clsx from "clsx";
import { defaultOptions, EncodeOptions } from "squoosh/src/features/encoders/webP/shared/meta.ts";
import { OptionTemplate } from "../codecs";
import { AnalyzeConfig, MeasureOptions } from "../encode";
import * as WebP from "../codecs/webp/client";
import { Button, Dialog } from "../ui";
import ImageInfoPanel from "./ImageInfoPanel";
import MetricsPanel from "./MetricsPanel";
import Styles from "./ConfigDialog.scss";
import EncoderPanel from "./EncoderPanel";
import PreprocessPanel from "./PreprocessPanel";

interface Props {
	image: ImageData;
	file: File;
	onStart: (config: AnalyzeConfig) => void;
	onClose: () => void;
	onSelectFile: () => void;
}

function createInitState(template: OptionTemplate[]) {

}

export default function ConfigDialog(props: Props) {
	const { file, image, onStart, onClose, onSelectFile } = props;

	const [options, setOptions] = useState<any>({});

	const [workerCount, setWorkerCount] = useState(navigator.hardwareConcurrency);

	const [measure, setMeasure] = useState<MeasureOptions>({
		time: false,
		SSIM: false,
		PSNR: true,
		butteraugli: false,
	});

	// TODO: WIP
	async function start() {
		const optionsList = new Array<EncodeOptions>(101);
		for (let i = 0; i < 101; i++) {
			optionsList[i] = { ...defaultOptions, quality: i, use_sharp_yuv: 1 };
		}
		onStart({
			encoder: WebP,
			optionsList,
			measure,
			threads: workerCount,
		});
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
			panel = <PreprocessPanel/>;
			break;
		case 2:
			panel = <EncoderPanel onChange={setOptions}/>;
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

	return (
		<Dialog className={Styles.dialog} onClose={onClose}>
			<div className={Styles.header}>{tabs}</div>
			{panel}
			<div className="dialog-actions">
				<Button onClick={onSelectFile}>Select file</Button>
				<Button color="second" onClick={onClose}>Cancel</Button>
				<Button disabled={!file} onClick={start}>Start</Button>
			</div>
		</Dialog>
	);
}
