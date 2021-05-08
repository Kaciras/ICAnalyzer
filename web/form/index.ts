import { Dispatch } from "react";
import RangeControl from "./RangeControl";
import EnumControl from "./EnumControl";
import SwitchControl from "./SwitchControl";

export interface OptionFieldProps<T, V> {
	isVariable: boolean;
	value: T;
	range: V;

	onVariabilityChange: Dispatch<boolean>;
	onValueChange: Dispatch<T>;
	onRangeChange: Dispatch<V>;
}

export interface FieldProps<T> {
	value: T;
	onChange: Dispatch<T>;

	active: boolean;
	onFocus: () => void;
}

export interface ControlType<T = any> {

	id: string;

	createState(): T[];

	Input(props: FieldProps<T>): JSX.Element;
}

export type OptionsKey = Record<string, any>;

export interface OptionsKeyPair {
	options: any;
	key: OptionsKey;
}

export interface OptionType<T = any, V = any> {

	id: string;

	createControl(range: V): ControlType<T>;

	createState(): [T, V];

	OptionField(props: OptionFieldProps<T, V>): JSX.Element;

	populate(value: T, options: any): void;

	generate(range: V, key: OptionsKey, options: any): OptionsKeyPair[];
}

export { BoolOption } from "./BoolOption";
export { EnumOption } from "./EnumOption";
export { NumberOption } from "./NumberOption";
export { PresetOption } from "./PresetOption";

export const controlMap = {
	bool: SwitchControl,
	enum: EnumControl,
	number: RangeControl,
};
