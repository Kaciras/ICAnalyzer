import { ReactNode } from "react";

export type OptionsState = Record<string, FieldProps>;

export interface FieldProps {
	isVariable: boolean;
	name: string;
}

export interface FormState {

}

export interface Field<T> {

	createInitState(): T;

	render(props: T): ReactNode;

	generate();
}
