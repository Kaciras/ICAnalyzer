import { CheckBox } from "../ui";
import { OptionType } from "../app/OptionTemplate";

export class BooleanTemplate implements OptionType<boolean, void> {

	readonly defaultValue: boolean;

	constructor(defaultValue: boolean) {
		this.defaultValue = defaultValue;
	}

	newValue(): boolean {
		return this.defaultValue;
	}

	ValueField(name: string, value: boolean) {
		return <CheckBox checked={value}/>;
	}

	newVariable() {
		return undefined;
	}

	VariableField(name: string) {
		return <strong>OFF & ON</strong>;
	}

	* generate(name: string, options: any) {
		yield { ...options, [name]: false };
		yield { ...options, [name]: true };
	}
}
