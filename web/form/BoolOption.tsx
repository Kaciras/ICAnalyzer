import type { FieldProps, OptionFieldProps, OptionType } from ".";
import { ControlType } from ".";
import { CheckBox, ControlField, SwitchButton } from "../ui";
import styles from "./BoolOption.scss";

interface Metadata {
	id: string;
	label: string;
	defaultValue: boolean | number;
}

export class BoolControl implements ControlType<boolean> {

	private readonly data: Metadata;

	constructor(data: Metadata) {
		this.data = data;
	}

	get id() {
		return this.data.id;
	}

	createState() {
		return [false, true];
	}

	Input(props: FieldProps<boolean>) {
		const { value, onChange } = props;
		const { label } = this.data;

		return (
			<ControlField {...props} className={styles.control}>
				{label}
				<SwitchButton
					checked={value}
					onValueChange={onChange}
					onClick={e => e.stopPropagation()}
				/>
			</ControlField>
		);
	}
}

export class BoolOption implements OptionType<boolean, undefined> {

	private readonly data: Metadata;

	constructor(data: Metadata) {
		this.data = data;
		this.OptionField = this.OptionField.bind(this);
	}

	get id() {
		return this.data.id;
	}

	createControl(range: undefined) {
		return new BoolControl(this.data);
	}

	createState() {
		return [Boolean(this.data.defaultValue), undefined] as [boolean, never];
	}

	OptionField(props: OptionFieldProps<boolean, undefined>) {
		const { id, label } = this.data;
		const { isVariable, value, onValueChange, onVariabilityChange } = props;

		return (
			<fieldset className={styles.container}>
				<CheckBox
					className={styles.label}
					checked={isVariable}
					onValueChange={onVariabilityChange}
				>
					{label}
				</CheckBox>
				{isVariable
					? <strong>OFF & ON</strong>
					: <SwitchButton name={id} checked={value} onValueChange={onValueChange}/>
				}
			</fieldset>
		);
	}

	populate(value: boolean, options: any) {
		options[this.data.id] = value;
	}

	generate(_: never, key: any, options: any) {
		const { id } = this.data;
		return [
			{
				key: { ...key, [id]: false },
				options: { ...options, [id]: false },
			},
			{
				key: { ...key, [id]: true },
				options: { ...options, [id]: true },
			},
		];
	}
}
