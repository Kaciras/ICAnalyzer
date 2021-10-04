import { Merger } from "../mutation";
import { ControlType, OptionMode, OptionsKeyPair, OptionStateMap, OptionType } from "../form";
import OptionsForm from "../form/OptionsForm";

export interface OptionPanelProps {
	className?: string;
	state: OptionStateMap;
	onChange: Merger<OptionStateMap>;
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
		const state: OptionStateMap = {};

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
		const { templates } = this;
		return OptionsForm({ ...props, templates });
	}

	generate(state: OptionStateMap) {
		const { defaults, templates } = this;

		function mapRange(pair: OptionsKeyPair, template: OptionType) {
			const { key, options } = pair;
			const { id } = template;
			const { range } = state[id];

			const values = template.getValues(range);
			const newList = [];

			for (const value of values) {
				const k = { ...key, [id]: value };
				const o = { ...options };

				template.populate(value, o);
				newList.push({ key: k, options: o });
			}

			return newList as OptionsKeyPair[];
		}

		let list: OptionsKeyPair[] = [{
			key: {},
			options: { ...defaults },
		}];

		const controls: ControlType[] = [];

		for (const template of templates) {
			const { mode, value, range } = state[template.id];

			if (mode === OptionMode.Range) {
				list = list.flatMap(p => mapRange(p, template));
				controls.push(template.createControl(range));
			} else {
				list.forEach(p => template.populate(value, p.options));
			}
		}

		return { optionsList: list, controls };
	}
}
