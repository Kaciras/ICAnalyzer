import React from "react";
import NumberInput from "./NumberInput";

// 互斥mode

export interface OptionType<F, V> {

	createFixedState(): F;

	createFixedInput(name: string, value: F): React.ReactElement;

	createVariableState(): V;

	createVariableInput(name: string, value: V): React.ReactElement;
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

	createFixedState() {
		return this.defaultValue;
	}

	createFixedInput(name: string, value: number) {
		const { min, max } = this;
		return (
			<label>
				<p>{name}</p>
				<input type="number" min={min} max={max} value={value}/>
			</label>
		);
	}

	createVariableState() {
		return {
			min: this.min,
			max: this.max,
			step: 1,
		};
	}

	createVariableInput(name: string, value: any) {
		const { min, max } = this;
		return (
			<div>
				<p>{name}</p>
				<label>
					<span>min: </span>
					<NumberInput value={value.min} min={min} max={max}/>
				</label>
				<label>
					<span>max: </span>
					<input type="number" min={min} max={max} value={value.max}/>
				</label>
				<label>
					<span>step: </span>
					<input type="number" min={min} max={max} value={value.step}/>
				</label>
			</div>
		);
	}
}

export class BooleanTemplate {

}

export class EnumTemplate {

}
