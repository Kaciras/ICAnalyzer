import type { FieldProps, OptionFieldProps, OptionType } from ".";
import { ControlType } from ".";
import { ChangeEvent } from "react";
import { CheckBox, ControlField, RadioBox } from "../ui";
import styles from "./EnumOption.scss";

interface ControlData {
	id: string;
	label: string;
	names: string[];
}

export interface EnumOptionConfig<T extends Record<string, any>> {
	id: string;
	label: string;
	enumObject: T;
	defaultValue: keyof T;
}

export class EnumControl implements ControlType<string> {

	private readonly data: ControlData;

	constructor(data: ControlData) {
		this.data = data;
		this.Input = this.Input.bind(this);
	}

	get id() {
		return this.data.id;
	}

	createState() {
		return this.data.names;
	}

	Input(props: FieldProps<string>) {
		const { id, label, names } = this.data;
		const { value, onChange } = props;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			onChange(e.currentTarget.name);
		}

		const items = names.map(name =>
			<RadioBox
				key={name}
				className={styles.item}
				checked={name === value}
				name={id}
				onChange={handleChange}
			>
				{name}
			</RadioBox>,
		);

		return (
			<ControlField {...props}>
				{label}
				<div>{items}</div>
			</ControlField>
		);
	}
}

export class EnumOption<T> implements OptionType<keyof T, Array<keyof T>> {

	protected readonly data: EnumOptionConfig<T>;

	constructor(data: EnumOptionConfig<T>) {
		this.data = data;
		this.OptionField = this.OptionField.bind(this);
	}

	get id() {
		return this.data.id;
	}

	createControl(names: Array<keyof T>) {
		const { id, label } = this.data;
		return new EnumControl({ id, label, names: (names as string[]) });
	}

	createState() {
		const { defaultValue } = this.data;
		return [defaultValue, [defaultValue]] as [keyof T, Array<keyof T>];
	}

	OptionField(props: OptionFieldProps<keyof T, Array<keyof T>>) {
		const { id, label, enumObject } = this.data;
		const { isVariable, value, range, onValueChange, onRangeChange, onVariabilityChange } = props;

		function handleChangeV(e: ChangeEvent<HTMLInputElement>) {
			const { checked, name } = e.currentTarget;
			let newVariables = [...range];

			if (checked) {
				newVariables.push(name as any);
			} else {
				newVariables = range.filter(v => v !== name);
			}

			if (newVariables.length > 0) {
				onRangeChange(newVariables);
			}
		}

		function handleChangeC(e: ChangeEvent<HTMLInputElement>) {
			onValueChange(e.currentTarget.value as keyof T);
		}

		let items: any[];
		if (isVariable) {
			items = Object.keys(enumObject).map(name => {
				return <CheckBox
					className={styles.item}
					key={name}
					name={name}
					checked={range.includes(name as any)}
					onChange={handleChangeV}
				>
					{name}
				</CheckBox>;
			});
		} else {
			items = Object.keys(enumObject).map(name => {
				return <RadioBox
					className={styles.item}
					key={name}
					name={id}
					value={name}
					checked={value === name}
					onChange={handleChangeC}
				>
					{name}
				</RadioBox>;
			});
		}

		return (
			<fieldset className={styles.fieldset}>
				<CheckBox
					className={styles.header}
					checked={isVariable}
					onValueChange={onVariabilityChange}
				>
					{label}
				</CheckBox>
				<div className={styles.body}>{items}</div>
			</fieldset>
		);
	}

	populate(value: keyof T, options: any) {
		const { id, enumObject } = this.data;
		options[id] = enumObject[value];
	}

	generate(range: Array<keyof T>, key: any, options: any) {
		const { id, enumObject } = this.data;

		return range.map(name => {
			const newKey = { ...key, [id]: name };
			const newOpts = { ...options, [id]: enumObject[name] };
			return { key: newKey, options: newOpts };
		});
	}
}
