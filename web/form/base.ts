import { Dispatch } from "react";
import { State } from "../codecs";

export interface StateProps {
	state: State;
	onChange: Dispatch<any>;
}

export interface ControlProps extends StateProps {
	onFocus: () => void;
}

export interface OptionType {

	id: string;

	ValueField(props: ControlProps): JSX.Element;

	OptionField(props: StateProps): JSX.Element;

	generate(State: State, prev: any): any[];
}
