import type { ControllerProps, OptionFieldProps, OptionType } from ".";
import { CheckBox, ControlField, SwitchButton } from "../ui";
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

	function Controller(props: ControllerProps<boolean, never>) {
		const { value, onChange } = props;

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

	return { id, initControlValue, newOptionState, Controller, OptionField, populate, generate };
}
