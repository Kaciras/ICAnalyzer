import React, { Dispatch, ReactElement } from "react";
import { CheckBoxInput, NumberInput, RadioInput } from "../ui";

// 互斥mode

export interface OptionType<F, V> {

	newValue(): F;

	ValueField(name: string, value: F, onChange: Dispatch<F>): ReactElement;

	newVariable(): V;

	VariableField(name: string, value: V): ReactElement;

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

	* generate(name: string, options: any, value: any): Iterable<any> {
		const { min, max, step } = value;
		for (let i = min; i < max; i += step) {
			yield { ...options, [name]: i };
		}
	}
}

export class BooleanTemplate implements OptionType<boolean, void> {

	readonly defaultValue: boolean;

	constructor(defaultValue: boolean) {
		this.defaultValue = defaultValue;
	}

	newValue(): boolean {
		return this.defaultValue;
	}

	ValueField(name: string, value: boolean) {
		return <CheckBoxInput checked={value}/>;
	}

	newVariable() {
		return undefined;
	}

	VariableField(name: string) {
		return <strong>OFF & ON</strong>;
	}

	* generate(name: string, options: any) {
		yield { ...options, [name]: false };
		yield { ...options, [name]: true };
	}
}

type EnumObject = Record<string, any>;

type EnumVariableState = Record<string, boolean>;

export class EnumTemplate<T extends EnumObject> implements OptionType<any, EnumVariableState> {

	private readonly enumObject: T;
	private readonly defaultValue: keyof T;

	constructor(enumObject: T, defaultValue: keyof T) {
		this.enumObject = enumObject;
		this.defaultValue = defaultValue;
	}

	newValue() {
		return this.defaultValue;
	}

	ValueField(name: string, value: any): React.ReactElement {
		const items = Object.keys(this.enumObject).map((name) => {
			return <RadioInput key={name} name={name} checked={value}>{name}</RadioInput>;
		});
		return <div>{items}</div>;
	}

	newVariable(): any {
		const map = Object.keys(this.enumObject).map(k => ({ [k]: false }));
		map[this.defaultValue] = true;
		return map;
	}

	VariableField(name: string, value: EnumVariableState): React.ReactElement {
		const items = Object.entries(value).map(e => {
			return <CheckBoxInput key={name} name={name} checked={e[1]}>{e[0]}</CheckBoxInput>;
		});
		return <div>{items}</div>;
	}

	generate(name: string, options: any, value: EnumVariableState) {
		return Object.entries(value)
			.filter(e => e[1])
			.map(e => this.enumObject[e[0]]);
	}
}

