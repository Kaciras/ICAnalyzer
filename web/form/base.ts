import { Dispatch } from "react";
import { EncoderState } from "../codecs";

export interface StateProps<T> {
	isVariable: boolean;
	state: T;
	onChange: Dispatch<T>;
	onVariabilityChange: Dispatch<boolean>;
}

export interface ControlProps<T> {
	state: T;
	onChange: Dispatch<T>;
	onFocus: () => void;
}

export interface OptionType<T = any> {

	id: string;

	initControlValue(state: T): any;

	ValueField(props: ControlProps<T>): JSX.Element;

	newOptionState(): T;

	OptionField(props: StateProps<T>): JSX.Element;

	generate(state: EncoderState, isVariable: boolean, prev: any): any[];
}
