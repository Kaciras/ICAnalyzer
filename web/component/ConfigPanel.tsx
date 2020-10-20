import React, { FormEvent, useState } from "react";
import clsx from "clsx";
import Styles from "./ConfigPanel.scss";
import { WebPOptionsTemplate } from "../options";
import { defaultOptions, EncodeOptions } from "squoosh/src/codecs/webp/encoder-meta";
import SelectFilePanel from "./SelectFilePanel";
import { MeasureOptions } from "../encoding";
import CheckBoxInput from "./CheckBoxInput";
import OptionsPanel, { OptionsInstance } from "./OptionsPanel";

interface MProps {
	yAxis: string[];
	options: MeasureOptions;
}

function MetricsPanel(props: MProps) {
	const { SSIM, PSNR, butteraugli } = props.options;

	let bOptions;
	if (butteraugli) {
		bOptions = (
			<fieldset>

			</fieldset>
		);
	}

	return (
		<form className={Styles.form}>
			<label>
				<span>Use pervious Y axis</span>
				<select>
					<option>(None)</option>
				</select>
			</label>
			<CheckBoxInput checked={SSIM}>Calculate SSIM</CheckBoxInput>
			<CheckBoxInput checked={PSNR}>Calculate PSNR</CheckBoxInput>
			<CheckBoxInput checked={!!butteraugli}>Calculate Butteraugli</CheckBoxInput>
			{bOptions}
		</form>
	);
}

interface Props {
	onStart: (file: File, optionsList: any[], measure: MeasureOptions) => void;
	onClose: () => void;
}

export default function ConfigPanel(props: Props) {
	const [file, setFile] = useState<File | string>();

	const [vars, setVars] = useState<string[]>(() => WebPOptionsTemplate
		.filter(t => t.defaultVariable).map(t => t.name));

	const [options, setOptions] = useState<OptionsInstance>({});

	const [measure, setMeasure] = useState<MeasureOptions>({
		SSIM: false,
		PSNR: true,
		butteraugli: false,
	});

	function loadFile(event: FormEvent<HTMLInputElement>) {
		setFile(event.currentTarget.files![0]);
	}

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
			props.onStart(f, optionsList, measure);
		} else {
			props.onStart(file!, optionsList, measure);
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
			panel = <SelectFilePanel setFile={setFile}/>;
			break;
		case 1:
			panel = <OptionsPanel
				vars={vars}
				options={options}
				onVarsChange={setVars}
			/>;
			break;
		case 2:
			panel = <MetricsPanel yAxis={[]} options={measure}/>;
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
