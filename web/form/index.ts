import { Dispatch } from "react";

export interface OptionFieldProps<T, V> {
	isVariable: boolean;
	value: T;
	range: V;

	onVariabilityChange: Dispatch<boolean>;
	onValueChange: Dispatch<T>;
	onRangeChange: Dispatch<V>;
}

export interface ControllerProps<T, V> {
	active: boolean;
	value: T;
	range: V;
	onChange: Dispatch<T>;
	onFocus: () => void;
}

interface ControlInit<T> {
	value: T;
	labels: string[];
}

export interface OptionType<T = any, V = any> {

	id: string;

	initControlValue(state: V): ControlInit<T>;

	Controller(props: ControllerProps<T, V>): JSX.Element;

	newOptionState(): [T, V];

	OptionField(props: OptionFieldProps<T, V>): JSX.Element;

	populate(value: T, options: any): void;

	generate(range: V, options: any): any[];
}

export { default as boolOption } from "./BoolOption";
export { default as enumOption } from "./EnumOption";
export { default as numberOption } from "./NumberOption";
export { default as presetOption } from "./PresetOption";
