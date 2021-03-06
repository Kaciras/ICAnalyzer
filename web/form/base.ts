import { Dispatch } from "react";
import { State } from "../codecs";

export interface StateProps {
	state: State;
	onChange: Dispatch<any>;
}

export interface OptionType {

	ValueField(props: StateProps): JSX.Element;

	OptionField(props: StateProps): JSX.Element;

	generate(state: any, prev: any): any[];
}
