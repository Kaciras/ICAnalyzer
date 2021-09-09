import { ChangeEvent } from "react";
import { CheckBox, RadioBox } from "../ui";
import { OptionMode } from "../codecs";
import type { OptionFieldProps, OptionType } from ".";
import ModeSwitcher from "./ModeSwitcher";
import EnumControl from "./EnumControl";
import styles from "./EnumControl.scss";

export interface EnumOptionConfig<T extends Record<string, any>> {
	id: string;
	label: string;
	enumObject: T;
	defaultValue: keyof T;
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
		const { mode, value, range, onValueChange, onRangeChange, onModeChange } = props;

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
		if (mode === OptionMode.Range) {
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
				<ModeSwitcher
					mode={mode}
					onChange={onModeChange}
				/>
				<span className={styles.label}>
					{label}
				</span>
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
