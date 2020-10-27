import React, { useState } from "react";
import clsx from "clsx";
import { defaultOptions, EncodeOptions } from "squoosh/src/codecs/webp/encoder-meta";
import { WebPOptionsTemplate } from "../options";
import { MeasureOptions } from "../encoding";
import Styles from "./ConfigPanel.scss";
import OptionsPanel, { OptionsInstance } from "./OptionsPanel";
import MyButton from "./MyButton";
import ImageInfoPanel from "./ImageInfoPanel";
import MetricsPanel from "./MetricsPanel";

interface Props {
	image: ImageData;
	file: File;
	onStart: (optionsList: any[], measure: MeasureOptions, workerCount: number) => void;
	onClose: () => void;
	onSelectFile: () => void;
}

export default function ConfigPanel(props: Props) {
	const { file, image, onStart, onClose, onSelectFile } = props;

	const [vars, setVars] = useState<string[]>(() => WebPOptionsTemplate
		.filter(t => t.defaultVariable).map(t => t.name));

	const [options, setOptions] = useState<OptionsInstance>({});

	const [workerCount, setWorkerCount] = useState(4);
	const [measure, setMeasure] = useState<MeasureOptions>({
		SSIM: false,
		PSNR: true,
		butteraugli: false,
	});

	// TODO: stub options
	async function start() {
		const optionsList = new Array<EncodeOptions>(101);
		for (let i = 0; i < 101; i++) {
			optionsList[i] = { ...defaultOptions, quality: i };
		}
		onStart(optionsList, measure, workerCount);
	}

	const [index, setIndex] = useState(0);

	const panels = ["Select File", "Options", "Metrics"];

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
			panel = <OptionsPanel
				vars={vars}
				options={options}
				onVarsChange={setVars}
			/>;
			break;
		case 2:
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
		<>
			<div className={Styles.header}>{tabs}</div>
			{panel}
			<div className="dialog-buttons">
				<MyButton onClick={onSelectFile}>Select file</MyButton>
				<MyButton onClick={onClose}>Cancel</MyButton>
				<MyButton disabled={!file} onClick={start}>Start</MyButton>
			</div>
		</>
	);
}
