import { RadioBox } from "../ui";
import { ControlType, FieldProps } from "./index";
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

		return <>{label}<div>{items}</div></>;
	}
}
