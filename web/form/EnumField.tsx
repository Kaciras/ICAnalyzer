import { CheckBox, RadioBox } from "../ui";
import { OptionType } from "../app/OptionTemplate";

type EnumObject = Record<string, any>;

type EnumVariableState = Record<string, boolean>;

export class EnumTemplate<T extends EnumObject> implements OptionType<any, EnumVariableState> {

	private readonly enumObject: T;
	private readonly defaultValue: keyof T;

	constructor(enumObject: T, defaultValue: keyof T) {
		this.enumObject = enumObject;
		this.defaultValue = defaultValue;
	}

	newValue() {
		return this.defaultValue;
	}

	ValueField(name: string, value: any): React.ReactElement {
		const items = Object.keys(this.enumObject).map((name) => {
			return <RadioBox key={name} name={name} checked={value}>{name}</RadioBox>;
		});
		return <div>{items}</div>;
	}

	newVariable(): any {
		const map = Object.keys(this.enumObject).map(k => ({ [k]: false }));
		map[this.defaultValue] = true;
		return map;
	}

	VariableField(name: string, value: EnumVariableState): React.ReactElement {
		const items = Object.entries(value).map(e => {
			return <CheckBox key={name} name={name} checked={e[1]}>{e[0]}</CheckBox>;
		});
		return <div>{items}</div>;
	}

	generate(name: string, options: any, value: EnumVariableState) {
		return Object.entries(value)
			.filter(e => e[1])
			.map(e => this.enumObject[e[0]]);
	}
}
