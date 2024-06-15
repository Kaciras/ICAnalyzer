import { Dispatch, JSX } from "react";

export interface FieldProps<T> {
	value: T;
	onChange: Dispatch<T>;
}

export interface ControlType<T = any> {

	id: string;

	label: string;

	createState(): T[];

	indexOf(value: T): number;

	Input(props: FieldProps<T>): JSX.Element;
}

export interface OptionState {
	value: any;
	range: any;
	isVariable: boolean;
}

export type OptionStateMap = Record<string, OptionState>;

export type OptionsKey = Record<string, any>;

export interface OptionsKeyPair {
	options: any;
	key: OptionsKey;
}

export interface OptionFieldProps<T, V> {
	isVariable: boolean;
	value: T;
	range: V;
	onValueChange: Dispatch<T>;
	onRangeChange: Dispatch<V>;
}

export interface OptionType<T = any, V = any> {

	id: string;

	createControl(range: V): ControlType;

	createState(): [T, V];

	OptionField(props: OptionFieldProps<T, V>): JSX.Element;

	populate(value: T, options: any): void;
}

export { BoolOption } from "./option/BoolOption";
export { EnumOption } from "./option/EnumOption";
export { NumberOption } from "./option/NumberOption";
