import React, { Dispatch, FormEvent } from "react";
import { WebPOptionsTemplate } from "../options";
import RadioInput from "./RadioInput";
import Styles from "./ConfigPanel.scss";

export interface OptionsInstance {
	[key: string]: {
		fixed?: any;
		variable?: any;
	}
}

interface Props {
	vars: string[];
	onVarsChange: Dispatch<string[]>;
	options: any;
}

export default function OptionsPanel(props: Props) {
	const { vars, options, onVarsChange } = props;

	const fields: React.ReactElement[] = [];

	for (const template of WebPOptionsTemplate) {
		const { name, type } = template;
		const option = options[name] ||= {};

		const isVariable = vars.includes(name);
		let element;

		if (isVariable) {
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
				<RadioInput
					checked={isVariable}
					name="vars"
				>
					{name}
				</RadioInput>
				{element}
			</div>);
	}

	return <form className={Styles.form}>{fields}</form>;
}
