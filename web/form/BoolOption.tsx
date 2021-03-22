import type { ControlFieldProps, OptionFieldProps, OptionType } from ".";
import { CheckBox, SwitchButton } from "../ui";
import styles from "./BoolOption.scss";

interface Metadata {
	id: string;
	label: string;
	defaultValue: boolean | number;
}

export default function boolOption(data: Metadata): OptionType<boolean, undefined> {
	const { id, label, defaultValue } = data;

	function initControlValue() {
		return { value: false, labels: ["false", "true"] };
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
					: <SwitchButton name={id} checked={value} onValueChange={onValueChange}/>
				}
			</fieldset>
		);
	}

	function populate(value: boolean, options: any) {
		options[id] = value;
	}

	function generate(_: never, options: any) {
		return [{ ...options, [id]: false }, { ...options, [id]: true }];
	}

	return { id, initControlValue, newOptionState, ControlField, OptionField, populate, generate };
}
