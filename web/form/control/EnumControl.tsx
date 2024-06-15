import type { ControlType, FieldProps } from "../index.ts";
import { RadioBox, RadioGroup } from "../../ui/index.ts";
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

	indexOf(value: string): number {
		return this.data.names.indexOf(value);
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
