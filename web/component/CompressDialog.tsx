import React, { FormEvent, useState } from "react";
import Styles from "./CompressDialog.scss";
import { WebPEncodeOptions } from "../worker/webp-encoder";
import { createWebPEncoder } from "../encoding";

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
					<input type="number" min={min} max={max} value={value.min}/>
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
];

interface OptionsInstance {
	[key: string]: {
		fixed?: any;
		variable?: any;
	}
}

interface Props {
	onChange: (file: File, encodedFiles: Uint8Array[]) => void;
	onClose: () => void;
}

// enum, intRange, bool, 互斥mode
export default function CompressDialog(props: Props) {
	const [file, setFile] = useState<File>();

	const [vars, setVars] = useState<string[]>(() => WebPOptionsTemplate
		.filter(t  => t.defaultVariable).map(t => t.name));

	const [options, setOptions] = useState<OptionsInstance>({});

	function loadFile(event: FormEvent<HTMLInputElement>) {
		setFile(event.currentTarget.files![0]);
	}

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

	return (
		<div className={Styles.dimmer}>
			<form className={Styles.dialog}>
				<fieldset>
					<input type="file" accept="image/*" onChange={start}/>
				</fieldset>
				<fieldset>
					<h2>Options</h2>
					{fields}
				</fieldset>

				<progress id="progress" value={progress} max={max}/>

				<button onClick={props.onClose}>Cancel</button>
				<button onClick={start}>Start</button>
			</form>
		</div>
	);
}
