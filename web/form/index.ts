import { Dispatch } from "react";
import RangeControl from "./control/RangeControl";
import EnumControl from "./control/EnumControl";
import SwitchControl from "./control/SwitchControl";
import { OptionMode } from "../codecs";

export interface OptionFieldProps<T, V> {
	mode: OptionMode;
	value: T;
	range: V;

	onModeChange: Dispatch<OptionMode>;
	onValueChange: Dispatch<T>;
	onRangeChange: Dispatch<V>;
}

export interface FieldProps<T> {
	value: T;
	onChange: Dispatch<T>;
}

export interface ControlType<T = any> {

	id: string;

	label: string;

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

	getValues(range: V): T[];
}

export { BoolOption } from "./option/BoolOption";
export { EnumOption } from "./option/EnumOption";
export { NumberOption } from "./option/NumberOption";

export const controlMap = {
	bool: SwitchControl,
	enum: EnumControl,
	number: RangeControl,
};
