import type { ControlType, FieldProps } from "../index.ts";
import NumberField from "../NumberField.tsx";

export interface NumberRange {
	min: number;
	max: number;
	step: number;
}

export function sequence(range: NumberRange) {
	const { min, max, step } = range;
	const length = Math.ceil((max + 1 - min) / step);
	return Array.from({ length }, (_, i) => min + i * step);
}

interface Metadata extends NumberRange {
	id: string;
	label: string;
}

export default class RangeControl implements ControlType<number> {

	readonly id: string;
	readonly label: string;

	private readonly data: Metadata;

	constructor(data: Metadata) {
		this.data = data;
		this.id = data.id;
		this.label = data.label;
		this.Input = this.Input.bind(this);
	}

	createState() {
		return sequence(this.data);
	}

	Input(props: FieldProps<number>) {
		const { id, label, min, max, step } = this.data;
		const { value, onChange } = props;

		return (
			<NumberField
				name={id}
				value={value}
				min={min}
				max={max}
				step={step}
				onChange={onChange}
			>
				{label}
			</NumberField>
		);
	}

	indexOf(value: number): number {
		const { min, step } = this.data;
		return (value - min) / step;
	}
}
