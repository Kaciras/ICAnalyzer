import { OptionsKeyPair, OptionType } from "../form";
import { EncoderState, OptionMode, OptionPanelProps } from "./index";

function renderOption(template: OptionType, props: OptionPanelProps) {
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

	function handleModeChange(mode: OptionMode) {
		const newOption = { ...state[id], mode };
		onChange({ ...state, [id]: newOption });
	}

	return (
		<OptionField
			{...state[id]}
			key={id}
			onValueChange={handleValueChange}
			onRangeChange={handleRangeChange}
			onModeChange={handleModeChange}
		/>
	);
}

export default class OptionsGenerator {

	private readonly templates: OptionType[];
	private readonly defaults: any;

	constructor(templates: OptionType[], defaults: any) {
		this.templates = templates;
		this.defaults = defaults;
		this.OptionsList = this.OptionsList.bind(this);
	}

	newState() {
		const state: EncoderState = {};

		for (const t of this.templates) {
			const [value, range] = t.createState();

			state[t.id] = {
				value,
				range,
				mode: OptionMode.Constant,
			};
		}
		return state;
	}

	OptionsList(props: OptionPanelProps) {
		return <>{this.templates.map(t => renderOption(t, props))}</>;
	}

	generate(state: EncoderState) {
		const { defaults, templates } = this;

		function applyOption(list: OptionsKeyPair[], template: OptionType) {
			const { id } = template;
			const { mode, value, range } = state[id];

			if (mode === OptionMode.Range) {
				const newList: OptionsKeyPair[] = [];

				for (const { key, options } of list) {
					const values = template.getValues(range);

					for (const value of values) {
						const k = { ...key, [id]: value };
						const o = { ...options };

						template.populate(value, o);
						newList.push({ key: k, options: o });
					}
				}
				return newList;
			} else if (mode === OptionMode.Constant) {
				list.forEach(({ options }) => template.populate(value, options));
				return list;
			}
			return list;
		}

		return templates.reduce(applyOption, [{ key: {}, options: { ...defaults } }]);
	}

	getControls(state: EncoderState) {
		return this.templates
			.filter(t => state[t.id].mode === OptionMode.Range)
			.map(t => t.createControl(state[t.id].range));
	}
}
