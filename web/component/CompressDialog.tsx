import React, { ChangeEvent, Dispatch, FormEvent, useState } from "react";
import Styles from "./CompressDialog.scss";
import { WebPEncodeOptions } from "../worker/webp-encoder";
import { createWebPEncoder } from "../encoding";
import NumberInput from "./NumberInput";
import clsx from "clsx";

interface OptionType<F, V> {

	createFixedState(): F;

	createFixedInput(name: string, value: F): React.ReactElement;

	createVariableState(): V;

	createVariableInput(name: string, value: V): React.ReactElement;
}

class NumberRangeTemplate implements OptionType<any, any> {

	readonly min: number;
	readonly max: number;
	readonly defaultValue: number;

	constructor(min: number, max: number, defaultValue: number) {
		this.min = min;
		this.max = max;
		this.defaultValue = defaultValue;
	}

	createFixedState() {
		return this.defaultValue;
	}

	createFixedInput(name: string, value: number) {
		const { min, max } = this;
		return (
			<label>
				<p>{name}</p>
				<input type="number" min={min} max={max} value={value}/>
			</label>
		);
	}

	createVariableState() {
		return {
			min: this.min,
			max: this.max,
			step: 1,
		};
	}

	createVariableInput(name: string, value: any) {
		const { min, max } = this;
		return (
			<div>
				<p>{name}</p>
				<label>
					<span>min: </span>
					<NumberInput value={value.min} min={min} max={max}/>
				</label>
				<label>
					<span>max: </span>
					<input type="number" min={min} max={max} value={value.max}/>
				</label>
				<label>
					<span>step: </span>
					<input type="number" min={min} max={max} value={value.step}/>
				</label>
			</div>
		);
	}
}

class BooleanTemplate {

}

interface OptionTemplate {
	label: string;
	name: string;
	type: OptionType<unknown, unknown>;
	defaultVariable?: true;
}

const WebPOptionsTemplate: OptionTemplate[] = [
	{
		label: "Quality (-q)",
		name: "quality",
		type: new NumberRangeTemplate(0, 100, 75),
		defaultVariable: true,
	},
	{
		label: "Method (-m)",
		name: "method",
		type: new NumberRangeTemplate(0, 6, 4),
	},
	{
		label: "Spatial noise shaping (-sns)",
		name: "sns",
		type: new NumberRangeTemplate(0, 6, 4),
	},
	{
		label: "Filter sharpness (-f)",
		name: "filter_sharpness",
		type: new NumberRangeTemplate(0, 100, 4),
	},
];

interface OptionsInstance {
	[key: string]: {
		fixed?: any;
		variable?: any;
	}
}

interface SFProps {
	setFile: Dispatch<File>
}

function SelectFilePanel(props: SFProps) {

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		props.setFile(event.currentTarget.files![0]);
	}

	return (
		<form className={Styles.form}>
			<input type="file" accept="image/*" onChange={handleChange}/>
		</form>
	);
}

interface OProps {
	vars: string[];
	options: any;
}

function OptionsPanel(props: OProps) {
	const { vars, options } = props;

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

		fields.push(<div key={name}><input type="radio"/>{element}</div>);
	}

	return <form className={Styles.form}>{fields}</form>;
}

function MetricsPanel() {
	return (
		<form className={Styles.form}>

		</form>
	);
}

interface Props {
	onChange: (file: File, encodedFiles: Uint8Array[]) => void;
	onClose: () => void;
}

// enum, intRange, bool, 互斥mode
export default function CompressDialog(props: Props) {
	const [file, setFile] = useState<File>();

	const [vars, setVars] = useState<string[]>(() => WebPOptionsTemplate
		.filter(t => t.defaultVariable).map(t => t.name));

	const [options, setOptions] = useState<OptionsInstance>({});

	function loadFile(event: FormEvent<HTMLInputElement>) {
		setFile(event.currentTarget.files![0]);
	}

	async function start() {
		if (!file) {
			throw new Error("File is null");
		}
		const canvas = new HTMLCanvasElement();

		const bitmap = await createImageBitmap(file);
		const { width, height } = bitmap;
		// setWidth(width);
		// setHeight(height);
		// setOriginal(file);
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext("2d")!;
		ctx.drawImage(bitmap, 0, 0);
		const canvasData = ctx.getImageData(0, 0, width, height);

		props.onChange(file, await encode(canvasData));
	}

	function encode(image: ImageData) {
		const optionsList = new Array<WebPEncodeOptions>(101);
		for (let i = 0; i < 101; i++) {
			optionsList[i] = { quality: i };
		}

		setMax(optionsList.length);
		setProgress(0);

		const encoder = createWebPEncoder();
		encoder.onProgress = setProgress;
		return encoder.encode(image, optionsList).start();
	}

	const [max, setMax] = useState(1);
	const [progress, setProgress] = useState(0);

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
		tabs.push(<div className={clazz} onClick={() => setIndex(i)}>{panel.name}</div>);
	}

	let panel;

	switch (index) {
	case 0:
		panel = <SelectFilePanel setFile={setFile}/>;
		break;
	case 1:
		panel = <OptionsPanel vars={vars} options={options}/>;
		break;
		case 2:
			panel= <MetricsPanel/>
			break;
	default:
		throw new Error();
	}

	return (
		<div className={Styles.dimmer}>
			<div className={Styles.dialog}>
				<header>
					{tabs}
				</header>
				{panel}
				<div className={Styles.footer}>
					{/*<progress id="progress" value={progress} max={max}/>*/}

					<button onClick={props.onClose}>Cancel</button>
					<button onClick={start}>Start</button>
				</div>
			</div>
		</div>
	);
}
