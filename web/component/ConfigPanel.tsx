import React, { Dispatch, FormEvent, useState } from "react";
import clsx from "clsx";
import Styles from "./ConfigPanel.scss";
import { WebPOptionsTemplate } from "../options";
import { defaultOptions, EncodeOptions } from "squoosh/src/codecs/webp/encoder-meta";
import RadioInput from "./RadioInput";
import SelectFilePanel from "./SelectFilePanel";

interface OptionsInstance {
	[key: string]: {
		fixed?: any;
		variable?: any;
	}
}

interface OProps {
	vars: string[];
	onVarsChange: Dispatch<string[]>;
	options: any;
}

function OptionsPanel(props: OProps) {
	const { vars, options, onVarsChange } = props;

	const fields: React.ReactElement[] = [];

	for (const template of WebPOptionsTemplate) {
		const { name, type } = template;
		const option = options[name] ||= {};
		let element;

		if (vars.includes(name)) {
			if (!("variable" in option)) {
				option.variable = type.createVariableState();
			}
			element = type.createVariableInput(name, option.variable);
		} else {
			if (!("fixed" in option)) {
				option.fixed = type.createFixedState();
			}
			element = type.createFixedInput(name, option.fixed);
		}

		const radioChange = (e: FormEvent<HTMLInputElement>) => {
			if (e.currentTarget.checked) onVarsChange([name]);
		};

		fields.push(
			<div key={name}>
				<RadioInput checked={true} name="vars"/>
				{element}
			</div>);
	}

	return <form className={Styles.form}>{fields}</form>;
}

interface Metrics {
	SSIM: boolean;
	PSNR: boolean;
	butteraugli: boolean;
}

interface MProps {

}

function MetricsPanel() {
	return (
		<form className={Styles.form}>
			<label>
				<span>Use pervious Y axis</span>
				<select></select>
			</label>
			<label>
				<input type="checkbox"/>
				<span>Calculate SSIM</span>
			</label>
			<label>
				<input type="checkbox"/>
				<span>Calculate PSNR</span>
			</label>
			<label>
				<input type="checkbox"/>
				<span>Calculate Butteraugli</span>
			</label>
		</form>
	);
}

interface Props {
	onStart: (file: File, optionsList: any[]) => void;
	onClose: () => void;
}

export default function ConfigPanel(props: Props) {
	const [file, setFile] = useState<File>();

	const [vars, setVars] = useState<string[]>(() => WebPOptionsTemplate
		.filter(t => t.defaultVariable).map(t => t.name));

	const [options, setOptions] = useState<OptionsInstance>({});

	function loadFile(event: FormEvent<HTMLInputElement>) {
		setFile(event.currentTarget.files![0]);
	}

	// TODO: stub options
	function start() {
		const optionsList = new Array<EncodeOptions>(101);
		for (let i = 0; i < 101; i++) {
			optionsList[i] = { ...defaultOptions, quality: i };
		}
		props.onStart(file!, optionsList);
	}

	const [index, setIndex] = useState(0);

	const panels = [
		{ name: "Select File", component: SelectFilePanel },
		{ name: "Options", component: OptionsPanel },
		{ name: "Metrics", component: MetricsPanel },
	];

	const tabs = [];
	for (let i = 0; i < panels.length; i++) {
		const panel = panels[i];
		const clazz = i === index ? clsx(Styles.tab, Styles.active) : Styles.tab;
		tabs.push(<div key={i} className={clazz} onClick={() => setIndex(i)}>{panel.name}</div>);
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
			panel = <MetricsPanel/>;
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
					Cancel
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
