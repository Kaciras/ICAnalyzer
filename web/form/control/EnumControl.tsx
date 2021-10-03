import { RadioBox, RadioGroup } from "../../ui";
import { ControlType, FieldProps } from "..";
import styles from "./EnumControl.scss";

interface ControlData {
	id: string;
	label: string;
	names: string[];
}

export default class EnumControl implements ControlType<string> {

	readonly id: string;
	readonly label: string;

	private readonly data: ControlData;

	constructor(data: ControlData) {
		this.data = data;
		this.id = data.id;
		this.label = data.label;
		this.Input = this.Input.bind(this);
	}

	createState() {
		return this.data.names;
	}

	Input(props: FieldProps<string>) {
		const { id, label, names } = this.data;
		const { value, onChange } = props;

		const radios = names.map(name =>
			<RadioBox
				key={name}
				className={styles.item}
				value={name}
			>
				{name}
			</RadioBox>,
		);

		return (
			<>
				{label}
				<RadioGroup
					value={value}
					name={id}
					onChange={onChange}
				>
					{radios}
				</RadioGroup>
			</>
		);
	}
}