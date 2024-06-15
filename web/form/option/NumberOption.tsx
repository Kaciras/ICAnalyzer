import { Dispatch } from "react";
import { OptionFieldProps, OptionType } from "../index.ts";
import { NumberInput } from "../../ui/index.ts";
import RangeControl, { NumberRange } from "../control/RangeControl.tsx";
import NumberField from "../NumberField.tsx";
import styles from "./NumberOption.scss";

interface RangePartProps {
	name: keyof NumberRange;
	range: NumberRange;
	onRangeChange: Dispatch<NumberRange>;

	min?: number;
	max?: number;
	step?: number;
}

function RangePart(props: RangePartProps) {
	const { name, min, max, step, range, onRangeChange } = props;

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

interface Metadata extends NumberRange {
	id: string;
	label: string;
	defaultValue: number;
}

export class NumberOption implements OptionType<number, NumberRange> {

	private readonly data: Metadata;

	constructor(data: Metadata) {
		this.data = data;
		this.VariableMode = this.VariableMode.bind(this);
		this.ConstMode = this.ConstMode.bind(this);
		this.OptionField = this.OptionField.bind(this);
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
		const { id, label, min, max, step } = this.data;
		const { value, onValueChange } = props;

		return (
			<NumberField
				name={id}
				value={value}
				min={min}
				max={max}
				step={step}
				onChange={onValueChange}
			>
				{label}
			</NumberField>
		);
	}

	VariableMode(props: OptionFieldProps<number, NumberRange>) {
		const { data } = this;
		const { range, onRangeChange } = props;

		const base = {
			...data,
			range,
			onRangeChange,
		};

		return (
			<fieldset className={styles.body}>
				<legend className={styles.legend}>
					{data.label}
				</legend>
				<RangePart {...base} name="min" max={range.max}/>
				<RangePart {...base} name="max" min={range.min}/>
				<RangePart {...base} name="step" min={data.step}/>
			</fieldset>
		);
	}

	populate(value: number, options: any) {
		options[this.data.id] = value;
	}

	OptionField(props: OptionFieldProps<number, NumberRange>) {
		return props.isVariable ? this.VariableMode(props) : this.ConstMode(props);
	}
}
