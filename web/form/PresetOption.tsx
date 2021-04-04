import { EnumOption } from "./EnumOption";

export class PresetOption<T> extends EnumOption<T> {

	generate(range: Array<keyof T>, key: any, options: any) {
		const { id } = this;

		return range.map(name => {
			const newKey = { ...key, [id]: name };
			const copy = { ...options };
			this.populate(name, copy);
			return { key: newKey, options: copy };
		});
	}

	populate(name: keyof T, options: any) {
		Object.entries(this.data.enumObject[name])
			.forEach(([k, v]) => options[k] = (typeof v === "function") ? v(options[k]) : v);
	}
}
