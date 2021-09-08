import { OptionsKeyPair, OptionType } from "../form";
import { EncoderState, OptionPanelProps } from "./index";

export function createState(templates: OptionType[]) {
	const state: EncoderState = {};

	for (const t of templates) {
		const [value, range] = t.createState();

		state[t.id] = {
			value,
			range,
			isVariable: false,
		};
	}
	return state;
}

export function renderOption(template: OptionType, props: OptionPanelProps) {
	const { id, OptionField } = template;
	const { state, onChange } = props;

	function handleValueChange(value: any) {
		const newOption = { ...state[id], value };
		onChange({ ...state, [id]: newOption });
	}

	function handleRangeChange(range: any) {
		const newOption = { ...state[id], range };
		onChange({ ...state, [id]: newOption });
	}

	function handleVariabilityChange(isVariable: boolean) {
		const newOption = { ...state[id], isVariable };
		onChange({ ...state, [id]: newOption });
	}

	return (
		<OptionField
			{...state[id]}
			key={id}
			onValueChange={handleValueChange}
			onRangeChange={handleRangeChange}
			onVariabilityChange={handleVariabilityChange}
		/>
	);
}

export function buildOptions(templates: OptionType[], state: EncoderState, defaults: any) {

	function applyOption(list: OptionsKeyPair[], template: OptionType) {
		const { id } = template;
		const { isVariable, value, range } = state[id];

		if (isVariable) {
			const newList: OptionsKeyPair[] = [];

			for (const { key, options } of list) {
				const generated = template.generate(range, key, options);
				newList.push(...generated);
			}
			return newList;
		} else {
			list.forEach(({ options }) => template.populate(value, options));
			return list;
		}
	}

	return templates.reduce(applyOption, [{ key: {}, options: { ...defaults } }]);
}
