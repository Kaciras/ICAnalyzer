import React, { Dispatch, ReactElement } from "react";
import { NumberInput } from "../ui";

export interface OptionType<F, V> {

	newValue(): F;

	ValueField(template: any, value: any, onChange: Dispatch<any>): ReactElement;

	newVariable(): V;

	VariableField(template: any, value: any, onChange: Dispatch<any>): ReactElement;

	generate(name: string, options: any, value: V): Iterable<any>;
}

export class NumberRangeTemplate implements OptionType<any, any> {

	readonly min: number;
	readonly max: number;
	readonly defaultValue: number;

	constructor(min: number, max: number, defaultValue: number) {
		this.min = min;
		this.max = max;
		this.defaultValue = defaultValue;
	}

	newValue() {
		return this.defaultValue;
	}

	ValueField(name: string, value: number) {
		const { min, max } = this;
		return (
			<label>
				<p>{name}</p>
				<input type="number" min={min} max={max} value={value}/>
			</label>
		);
	}

	newVariable() {
		return {
			min: this.min,
			max: this.max,
			step: 1,
		};
	}

	VariableField(name: string, value: any) {
		const { min, max } = this;
		return (
			<div>
				<p>{name}</p>
				<label>
					<span>from:</span>
					<NumberInput value={value.min} min={min} max={max}/>
				</label>
				<label>
					<span>to:</span>
					<input type="number" min={min} max={max} value={value.max}/>
				</label>
				<label>
					<span>step:</span>
					<input type="number" min={min} max={max} value={value.step}/>
				</label>
			</div>
		);
	}

	* generate(name: string, options: any, value: any): Iterable<any> {
		const { min, max, step } = value;
		for (let i = min; i < max; i += step) {
			yield { ...options, [name]: i };
		}
	}
}
