import { Dispatch } from "react";

export interface OptionFieldProps<T, V> {
	isVariable: boolean;
	value: T;
	range: V;

	onVariabilityChange: Dispatch<boolean>;
	onValueChange: Dispatch<T>;
	onRangeChange: Dispatch<V>;
}

export interface ControlFieldProps<T, V> {
	value: T;
	range: V;
	onChange: Dispatch<T>;
	onFocus: () => void;
}

export interface OptionType<T = any, V = any> {

	id: string;

	initControlValue(state: V): T;

	ControlField(props: ControlFieldProps<T, V>): JSX.Element;

	newOptionState(): [T, V];

	OptionField(props: OptionFieldProps<T, V>): JSX.Element;

	populate(value: T, options: any): void;

	generate(range: V, options: any): any[];
}

export { default as boolOption } from "./BoolOption";
export { default as enumOption } from "./EnumOption";
export { default as numberOption } from "./NumberOption";
