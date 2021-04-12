import { ControlType, FieldProps } from "./index";
import { ControlField, RadioBox } from "../ui";
import styles from "./EnumControl.scss";

interface ControlData {
	id: string;
	label: string;
	names: string[];
}

export default class EnumControl implements ControlType<string> {

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

		const items = names.map(name =>
			<RadioBox
				key={name}
				className={styles.item}
				checked={name === value}
				name={id}
				onChange={() => onChange(name)}
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
