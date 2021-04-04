import type { ControlType, FieldProps, OptionFieldProps, OptionType } from ".";
import { CheckBox, ControlField, NumberInput, RangeInput } from "../ui";
import styles from "./NumberOption.scss";

interface NumberRange {
	min: number;
	max: number;
	step: number;
}

function sequence(range: NumberRange) {
	const { min, max, step } = range;
	return new Array<number>(Math.ceil((max + 1 - min) / step))
		.fill(min)
		.map((v, i) => v + i * step);
}

interface Metadata extends NumberRange {
	id: string;
	label: string;
	offset?: number;
	defaultValue: number;
}

export class NumberControl implements ControlType<number> {

	private readonly data: Metadata;

	constructor(data: Metadata) {
		this.data = data;
		this.Input = this.Input.bind(this);
	}

	get id() {
		return this.data.id;
	}

	createState() {
		return sequence(this.data);
	}

	Input(props: FieldProps<number>) {
		const { id, label, min, max, step } = this.data;
		const { value, onChange } = props;

		return (
			<ControlField {...props}>
				<div className={styles.header}>
					<span className={styles.label}>{label}</span>
					{value}
				</div>
				<RangeInput
					name={id}
					value={value}
					min={min}
					max={max}
					step={step}
					onClick={e => e.stopPropagation()}
					onValueChange={onChange}
				/>
			</ControlField>
		);
	}
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
		return new NumberControl({ ...this.data, ...range });
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
		const { step } = this.data;
		const { range, onRangeChange } = props;

		function handleChange(name: keyof NumberRange, valueAsNumber: number) {
			onRangeChange({ ...range, [name]: valueAsNumber });
		}

		interface FieldProps {
			name: keyof NumberRange;
			min?: number;
			max?: number;
			step?: number;
		}

		const Field = (props: FieldProps) => {
			const { name, min, max, step } = { ...this.data, ...props };

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
						onValueChange={v => handleChange(name, v)}
					/>
				</label>
			);
		};

		return (
			<div className={styles.body}>
				<Field name="min" max={range.max}/>
				<Field name="max" min={range.min}/>
				<Field name="step" min={step}/>
			</div>
		);
	}

	OptionField(props: OptionFieldProps<number, NumberRange>) {
		const { VariableMode, ConstMode } = this;
		const { label } = this.data;
		const { isVariable, value, onVariabilityChange } = props;

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
					{!isVariable && value}
				</div>
				{isVariable ? <VariableMode {...props}/> : <ConstMode {...props}/>}
			</fieldset>
		);
	}

	populate(value: number, options: any) {
		const { id, offset = 0 } = this.data;
		options[id] = offset + value;
	}

	generate(range: NumberRange, key: any, options: any) {
		const { id, offset = 0 } = this.data;

		return sequence(range).map(value => {
			value += offset;
			const newOpts = { ...options, [id]: value };
			const newKey = { ...key, [id]: value };
			return { key: newKey, options: newOpts };
		});
	}
}
