import { Dispatch } from "react";
import { CheckBox, NumberInput, RangeInput } from "../ui";
import type { OptionFieldProps, OptionType } from ".";
import RangeControl, { NumberRange, sequence } from "./RangeControl";
import styles from "./RangeControl.scss";
import { IDENTITY } from "../utils";

interface RangePartProps {
	name: keyof NumberRange;
	range: NumberRange;
	onRangeChange: Dispatch<NumberRange>;

	min?: number;
	max?: number;
	step?: number;
}

interface Metadata extends NumberRange {
	id: string;
	label: string;
	mapFn?: (index: number) => number;
	defaultValue: number;
}

export class NumberOption implements OptionType<number, NumberRange> {

	private readonly data: Metadata;

	constructor(data: Metadata) {
		this.data = data;
		this.VariableMode = this.VariableMode.bind(this);
		this.ConstMode = this.ConstMode.bind(this);
		this.OptionField = this.OptionField.bind(this);
		this.RangePart = this.RangePart.bind(this);
	}

	get id() {
		return this.data.id;
	}

	createControl(range: NumberRange) {
		const { min, max, step } = range;
		const reachableMax = Math.floor((max - min) / step) * step + min;
		return new RangeControl({ ...this.data, ...range, max: reachableMax });
	}

	createState() {
		const { min, max, step, defaultValue } = this.data;
		return [defaultValue, { min, max, step }] as [number, NumberRange];
	}

	ConstMode(props: OptionFieldProps<number, NumberRange>) {
		const { id, min, max, step } = this.data;
		const { value, onValueChange } = props;

		return (
			<RangeInput
				className={styles.body}
				name={id}
				value={value}
				min={min}
				max={max}
				step={step}
				onValueChange={onValueChange}
			/>
		);
	}

	VariableMode(props: OptionFieldProps<number, NumberRange>) {
		const { RangePart } = this;
		const { step } = this.data;
		const { range, onRangeChange } = props;

		return (
			<div className={styles.body}>
				<RangePart range={range} onRangeChange={onRangeChange} name="min" max={range.max}/>
				<RangePart range={range} onRangeChange={onRangeChange} name="max" min={range.min}/>
				<RangePart range={range} onRangeChange={onRangeChange} name="step" min={step}/>
			</div>
		);
	}

	RangePart(props: RangePartProps) {
		const { name, min, max, step, range, onRangeChange } = { ...this.data, ...props };

		function handleChange(valueAsNumber: number) {
			onRangeChange({ ...range, [name]: valueAsNumber });
		}

		return (
			<label className={styles.spinner}>
				<span>{name}</span>
				<NumberInput
					className={styles.numberInput}
					name={name}
					value={range[name]}
					min={min}
					max={max}
					step={step}
					onValueChange={handleChange}
				/>
			</label>
		);
	}

	OptionField(props: OptionFieldProps<number, NumberRange>) {
		const { VariableMode, ConstMode } = this;
		const { label, min, max, step } = this.data;
		const { isVariable, value, onVariabilityChange, onValueChange } = props;

		return (
			<fieldset className={styles.fieldset}>
				<div className={styles.header}>
					<CheckBox
						className={styles.label}
						checked={isVariable}
						onValueChange={onVariabilityChange}
					>
						{label}
					</CheckBox>
					{
						!isVariable &&
						<input
							className={styles.input}
							type="number"
							min={min}
							max={max}
							step={step}
							value={value}
							onChange={e => onValueChange(e.target.valueAsNumber)}
						/>
					}
				</div>
				{isVariable ? <VariableMode {...props}/> : <ConstMode {...props}/>}
			</fieldset>
		);
	}

	populate(value: number, options: any) {
		const { id, mapFn = IDENTITY } = this.data;
		options[id] = mapFn(value);
	}

	generate(range: NumberRange, key: any, options: any) {
		const { id,  mapFn = IDENTITY } = this.data;

		return sequence(range).map(value => {
			const newOpts = { ...options, [id]: mapFn(value) };
			const newKey = { ...key, [id]: value };
			return { key: newKey, options: newOpts };
		});
	}
}
