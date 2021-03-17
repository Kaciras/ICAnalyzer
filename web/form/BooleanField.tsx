import { CheckBox, SwitchButton } from "../ui";
import { ControlFieldProps, OptionFieldProps, OptionType } from "./base";
import styles from "./BooleanField.scss";

interface Metadata {
	property: string;
	label: string;
	defaultValue: boolean | number;
}

export default function boolOption(data: Metadata): OptionType<boolean, undefined> {
	const { property, label, defaultValue } = data;

	function initControlValue() {
		return false;
	}

	function newOptionState() {
		return [Boolean(defaultValue), undefined] as [boolean, never];
	}

	function ControlField(props: ControlFieldProps<boolean, never>) {
		const { value, onChange, onFocus } = props;

		return (
			<label onClick={onFocus}>
				<CheckBox
					checked={value}
					onValueChange={onChange}
				>
					{label}
				</CheckBox>
			</label>
		);
	}

	function OptionField(props: OptionFieldProps<boolean, undefined>) {
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
					: <SwitchButton checked={value} onValueChange={onValueChange}/>
				}
			</fieldset>
		);
	}

	function populate(value: boolean, options: any) {
		options[property] = value;
	}

	function generate(_: never, options: any) {
		return [
			{ ...options, [property]: true },
			{ ...options, [property]: false },
		];
	}

	return { id: property, initControlValue, newOptionState, ControlField, OptionField, populate, generate };
}
