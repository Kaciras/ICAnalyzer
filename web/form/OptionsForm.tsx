import { Dispatch } from "react";
import clsx from "clsx";
import { EncoderState, OptionMode } from "../codecs";
import ModeSwitcher from "./ModeSwitcher";
import { OptionType } from "./index";
import styles from "./OptionsForm.scss";

export interface OptionsFormProps {
	className?: string;
	templates: OptionType[];
	state: EncoderState;
	onChange: Dispatch<EncoderState>;
}

export default function OptionsForm(props: OptionsFormProps) {
	const { templates, className, state, onChange } = props;
	const items = [];

	for (const template of templates) {
		const { id, OptionField } = template;

		function handleValueChange(value: any) {
			const newOption = { ...state[id], value };
			onChange({ ...state, [id]: newOption });
		}

		function handleRangeChange(range: any) {
			const newOption = { ...state[id], range };
			onChange({ ...state, [id]: newOption });
		}

		function handleModeChange(mode: OptionMode) {
			const newOption = { ...state[id], mode };
			onChange({ ...state, [id]: newOption });
		}

		items.push(
			<ModeSwitcher
				mode={state[id].mode}
				onChange={handleModeChange}
			/>,
			<OptionField
				{...state[id]}
				key={id}
				onValueChange={handleValueChange}
				onRangeChange={handleRangeChange}
				onModeChange={handleModeChange}
			/>,
		);
	}

	return <form className={clsx(styles.form, className)}>{items}</form>;
}
