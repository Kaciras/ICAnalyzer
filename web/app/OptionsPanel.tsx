import React, { ChangeEvent, Dispatch } from "react";
import { ENCODER_MAP, ENCODERS, ImageEncoder } from "../options";
import { RadioInput } from "../ui";

type OptionsState = Record<string, any>;

interface OptionsSetProps {
	vars: string[];
	onVarsChange: Dispatch<string[]>;
	valueState: OptionsState;
	variableState: OptionsState;
}

function OptionsSet(props: OptionsSetProps) {

}

interface EncodingConfig {
	vars: string[];
	valueState: OptionsState;
	variableState: OptionsState;
}

interface Props {
	encoder: ImageEncoder;
	config: EncodingConfig;

	onConfigChange: Dispatch<EncodingConfig>;
	onEncoderChange: Dispatch<ImageEncoder>;
}

export default function OptionsPanel(props: Props) {
	const { encoder, onConfigChange, onEncoderChange } = props;
	const { vars, valueState, variableState } = props.config;

	function handleEncoderChange(event: ChangeEvent<HTMLSelectElement>) {
		onEncoderChange(ENCODER_MAP[event.currentTarget.value]);
	}

	const fields = encoder.optionTemplate.map(template => {
		const { name, type } = template;

		const isVariable = vars.includes(name);

		let element;
		if (isVariable) {
			element = type.VariableField(name, variableState[name]);
		} else {
			element = type.ValueField(name, valueState[name]);
		}

		const handleRadioChange = (v: boolean) => {
			if (v) onVarsChange([name]);
		};

		return (
			<div key={name}>
				<RadioInput
					checked={isVariable}
					name="vars"
					onChange={handleRadioChange}
				>
					{name}
				</RadioInput>
				{element}
			</div>);
	});

	// TODO: builtinResize
	return (
		<form>
			<select value={encoder.name} onChange={handleEncoderChange}>
				{ENCODERS.map(e => <option key={e.name}>{e.name}</option>)}
			</select>
			<span>Resize:</span>
			<select>
				<option>100</option>
				<option>50</option>
				<option>25</option>
				<option>12.5</option>
				<option>6.25</option>
			</select>
			<fieldset>{fields}</fieldset>
		</form>
	);
}
