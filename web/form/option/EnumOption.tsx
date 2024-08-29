import { ChangeEvent } from "react";
import { OptionFieldProps, OptionType } from "../index.ts";
import { CheckBox, RadioBox } from "../../ui/index.ts";
import EnumControl from "../control/EnumControl.tsx";
import styles from "./EnumOption.css";
import { guessEnumNames } from "../../utils.ts";

export interface EnumOptionConfig<T> {
	id: string;
	label: string;
	enumObject?: T;
	names?: readonly string[];
	defaultValue: keyof T;
}

export class EnumOption<T extends Record<string, any>> implements OptionType<keyof T, Array<keyof T>> {

	readonly data: EnumOptionConfig<T>;
	readonly keys: readonly string[];

	constructor(data: EnumOptionConfig<T>) {
		this.data = data;
		this.OptionField = this.OptionField.bind(this);
		this.keys = data.names ?? guessEnumNames(data.enumObject!);
	}

	get id() {
		return this.data.id;
	}

	createControl(names: Array<keyof T>) {
		const { id, label } = this.data;
		return new EnumControl({
			id,
			label,
			names: this.keys.filter(k => names.includes(k)),
		});
	}

	createState() {
		const { defaultValue } = this.data;
		return [defaultValue, [defaultValue]] as [keyof T, Array<keyof T>];
	}

	populate(value: keyof T, options: any) {
		options[this.data.id] = value;
	}

	OptionField(props: OptionFieldProps<keyof T, Array<keyof T>>) {
		const { id, label } = this.data;
		const { isVariable, value, range, onValueChange, onRangeChange } = props;

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
			items = this.keys.map(name =>
				<CheckBox
					className={styles.item}
					key={name}
					name={name}
					checked={range.includes(name as any)}
					onChange={handleChangeV}
				>
					{name}
				</CheckBox>,
			);
		} else {
			items = this.keys.map(name =>
				<RadioBox
					className={styles.item}
					key={name}
					name={id}
					value={name}
					checked={value === name}
					onChange={handleChangeC}
				>
					{name}
				</RadioBox>,
			);
		}

		return (
			<div className={styles.fieldset}>
				<span className={styles.label}>
					{label}
				</span>
				<div className={styles.body}>{items}</div>
			</div>
		);
	}
}
