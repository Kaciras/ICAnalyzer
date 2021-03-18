import { OptionType } from "../form";
import { EncoderState } from "./index";

export function buildOptions(templates: OptionType[], state: EncoderState) {
	const { varNames, values, ranges } = state;

	function map(list: any[], t: OptionType) {
		return list
			.map(options => {
				if (varNames.includes(t.id)) {
					return t.generate(ranges[t.id], options);
				}
				t.populate(values[t.id], options);
				return [options];
			})
			.reduce((p, c) => p.concat(c), []);
	}

	return templates.reduce(map, [{}]);
}

export function mergeOptions<T>(base: T, from: Partial<T>) {
	const invalidKey = process.env.NODE_ENV === "production"
		? undefined
		: Object.keys(from).find(k => !(k in base));

	if (invalidKey) {
		throw new Error(`Unexpected options property: ${invalidKey}`);
	}
	return { ...base, ...from } as T;
}
