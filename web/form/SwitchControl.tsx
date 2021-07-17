import type { ControlType, FieldProps } from ".";
import { ControlField, SwitchButton } from "../ui";
import styles from "./SwitchControl.scss";

export interface SwitchControlConfig {
	id: string;
	label: string;
}

export default class SwitchControl implements ControlType<boolean> {

	private readonly data: SwitchControlConfig;

	constructor(data: SwitchControlConfig) {
		this.data = data;
		this.Input = this.Input.bind(this);
	}

	get id() {
		return this.data.id;
	}

	get label() {
		return this.data.label;
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
