import enumOption, { Metadata } from "./EnumOption";

export default function presetOption<T>(data: Metadata<T>) {
	const { enumObject } = data;
	const parent = enumOption(data);

	parent.generate = (range, options) => range.map(name => {
		const copy = { ...options };
		parent.populate(name, copy);
		return copy;
	});


	parent.populate = (name, options) => {
		Object.entries(enumObject[name])
			.forEach(([k, v]) => options[k] = (typeof v === "function") ? v(options[k]) : v);
	};

	return parent;
}
