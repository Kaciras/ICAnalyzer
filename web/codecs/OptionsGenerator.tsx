import { Merger } from "../mutation.ts";
import { ControlType, OptionMode, OptionsKeyPair, OptionStateMap, OptionType } from "../form/index.ts";
import OptionsForm from "../form/OptionsForm.tsx";

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

			return template.getValues(range).map(value => {
				const k = { ...key, [id]: value };
				const o = { ...options };
				template.populate(value, o);

				return { key: k, options: o } as OptionsKeyPair;
			});
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
