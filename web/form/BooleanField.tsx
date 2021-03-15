import { CheckBox, SwitchButton } from "../ui";
import { EncoderState } from "../codecs";
import { ControlProps, OptionType, StateProps } from "./base";
import styles from "./BooleanField.scss";

interface Metadata {
	property: string;
	label: string;
	defaultValue: boolean | number;
}

export default function boolOption(data: Metadata): OptionType<boolean> {
	const { property, label, defaultValue } = data;

	function newState() {
		return Boolean(defaultValue);
	}

	function ValueField(props: ControlProps<boolean>) {
		const { state, onChange, onFocus } = props;

		return (
			<label onFocus={onFocus}>
				<CheckBox
					checked={state}
					onValueChange={onChange}
				>
					{label}
				</CheckBox>
			</label>
		);
	}

	function OptionField(props: StateProps<boolean>) {
		const { isVariable, state, onChange, onVariabilityChange } = props;

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
					: <SwitchButton checked={state} onValueChange={onChange}/>
				}
			</fieldset>
		);
	}

	function generate(state: EncoderState, isVariable: boolean, prev: any) {
		const { varNames, data } = state;

		if (isVariable) {
			return [
				{ ...prev, [property]: false },
				{ ...prev, [property]: true },
			];
		} else {
			prev[property] = data[property] as boolean;
			return [prev];
		}
	}

	return { id: property, newState, ValueField, OptionField, generate };
}
