import React, { ChangeEvent, Dispatch, useState } from "react";
import clsx from "clsx";
import { defaultOptions, EncodeOptions } from "squoosh/src/codecs/webp/encoder-meta";
import { WebPOptionsTemplate } from "../options";
import { defaultButteraugliOptions } from "../../lib/similarity";
import { MeasureOptions } from "../encoding";
import NumberInput from "./NumberInput";
import CheckBoxInput from "./CheckBoxInput";
import Styles from "./ConfigPanel.scss";
import SelectFilePanel from "./SelectFilePanel";
import OptionsPanel, { OptionsInstance } from "./OptionsPanel";

interface MProps {
	workerCount: number;
	options: MeasureOptions;
	onWorkerCountChange: Dispatch<number>;
	onMeasureChange: Dispatch<MeasureOptions>;
}

function MetricsPanel(props: MProps) {
	const { workerCount, onWorkerCountChange, onMeasureChange } = props;
	const { SSIM, PSNR, butteraugli } = props.options;

	const [butteraugliVal, setButteraugliVal] = useState(defaultButteraugliOptions);
	let butteraugliOptions;

	if (butteraugli) {
		const { badQualitySeek, goodQualitySeek, hfAsymmetry } = butteraugli;
		butteraugliOptions = (
			<fieldset>
				<NumberInput min={0} step={0.1} value={hfAsymmetry}/>
				<NumberInput min={0} max={2} step={0.1} value={badQualitySeek}/>
				<NumberInput min={0} max={2} step={0.1} value={goodQualitySeek}/>
			</fieldset>
		);
	}

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, checked } = event.currentTarget;
		const newValue = name !== "butteraugli" ? checked : checked && butteraugliVal;
		onMeasureChange({ ...props.options, [name]: newValue });
	}

	return (
		<form className={Styles.fieldset}>
			<label>
				Worker count:
				<NumberInput min={1} step={1} value={workerCount} onChange={onWorkerCountChange}/>
			</label>
			<CheckBoxInput
				checked={SSIM}
				name="SSIM"
				onChange={handleChange}
			>
				Calculate SSIM
			</CheckBoxInput>
			<CheckBoxInput
				checked={PSNR}
				name="PSNR"
				onChange={handleChange}
			>
				Calculate PSNR
			</CheckBoxInput>
			<CheckBoxInput
				checked={!!butteraugli}
				name="butteraugli"
				onChange={handleChange}
			>
				Calculate Butteraugli
			</CheckBoxInput>
			{butteraugliOptions}
		</form>
	);
}

interface Props {
	onStart: (file: File, optionsList: any[], measure: MeasureOptions, workerCount: number) => void;
	onClose: () => void;
}

export default function ConfigPanel(props: Props) {
	const [file, setFile] = useState<File | string>();

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
		if (typeof file === "string") {
			const blob = await (await fetch(file)).blob();
			const name = new URL(file).pathname.split("/").pop()!;
			const f = new File([blob], name);
			props.onStart(f, optionsList, measure, workerCount);
		} else {
			props.onStart(file!, optionsList, measure, workerCount);
		}
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
			panel = <SelectFilePanel onFileChange={setFile}/>;
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
			<div className={Styles.footer}>
				<button
					className={clsx(Styles.button, Styles.minor)}
					onClick={props.onClose}
				>
					威威威威阿斯顿
				</button>
				<button
					className={clsx(Styles.button, Styles.primary)}
					disabled={!file}
					onClick={start}
				>
					Start
				</button>
			</div>
		</>
	);
}
