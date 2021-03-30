import type { ControllerProps, OptionFieldProps, OptionType } from ".";
import { CheckBox, ControlField, NumberInput, RangeInput } from "../ui";
import styles from "./NumberOption.scss";

interface NumberRange {
	min: number;
	max: number;
	step: number;
}

interface Metadata extends NumberRange {
	id: string;
	label: string;
	offset?: number;
	defaultValue: number;
}

export default function numberOption(data: Metadata): OptionType<number, NumberRange> {
	const { id, label, min, max, step, offset = 0, defaultValue } = data;

	function sequence(range: NumberRange) {
		const { min, max, step } = range;
		return new Array<number>(Math.ceil((max + 1 - min) / step))
			.fill(min)
			.map((v, i) => v + offset + i * step);
	}

	function initControlValue(range: NumberRange) {
		const labels = sequence(range).map(v => v.toString());
		return { value: range.min, labels };
	}

	function newOptionState() {
		return [defaultValue, { min, max, step }] as [number, NumberRange];
	}

	function Controller(props: ControllerProps<number, NumberRange>) {
		const { value, range, onChange } = props;
		const { min, max, step } = range;

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

	function ConstMode(props: OptionFieldProps<number, NumberRange>) {
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

	function VariableMode(props: OptionFieldProps<number, NumberRange>) {
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
			const { name, min, max, step } = { ...data, ...props };

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

	function OptionField(props: OptionFieldProps<number, NumberRange>) {
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

	function populate(value: number, options: any) {
		options[id] = offset + value;
	}

	function generate(range: NumberRange, options: any) {
		return sequence(range).map(value => ({ ...options, [id]: value }));
	}

	return { id, initControlValue, newOptionState, Controller, OptionField, populate, generate };
}
