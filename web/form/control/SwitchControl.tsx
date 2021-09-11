import { SwitchButton } from "../../ui";
import { ControlType, FieldProps } from "..";
import styles from "./SwitchControl.scss";

export interface SwitchControlConfig {
	id: string;
	label: string;
}

export default class SwitchControl implements ControlType<boolean> {

	readonly id: string;
	readonly label: string;

	private readonly data: SwitchControlConfig;

	constructor(data: SwitchControlConfig) {
		this.data = data;
		this.id = data.id;
		this.label = data.label;
		this.Input = this.Input.bind(this);
	}

	createState() {
		return [false, true];
	}

	Input(props: FieldProps<boolean>) {
		const { value, onChange } = props;
		const { label } = this.data;

		return (
			<div className={styles.control}>
				{label}
				<SwitchButton
					checked={value}
					onValueChange={onChange}
					onClick={e => e.stopPropagation()}
				/>
			</div>
		);
	}
}
