import { OptionFieldProps, OptionMode, OptionType } from "../index.ts";
import { SwitchButton } from "../../ui/index.ts";
import SwitchControl from "../control/SwitchControl.tsx";
import styles from "./BoolOption.scss";

export interface BoolVariableConfig {
	id: string;
	label: string;
	defaultValue: boolean | number;
}

export class BoolOption implements OptionType<boolean> {

	private readonly data: BoolVariableConfig;

	constructor(data: BoolVariableConfig) {
		this.data = data;
		this.OptionField = this.OptionField.bind(this);
	}

	get id() {
		return this.data.id;
	}

	createControl(range: undefined) {
		return new SwitchControl(this.data);
	}

	createState() {
		return [Boolean(this.data.defaultValue), undefined] as [boolean, never];
	}

	getValues() {
		return [false, true];
	}

	populate(value: boolean, options: any) {
		options[this.data.id] = value;
	}

	OptionField(props: OptionFieldProps<boolean, any>) {
		const { id, label } = this.data;
		const { mode, value, onValueChange } = props;

		return (
			<div className={styles.container}>
				<span className={styles.label}>
					{label}
				</span>
				{
					mode === OptionMode.Range
						? <strong>OFF & ON</strong>
						: <SwitchButton
							name={id}
							checked={value}
							onCheckedChange={onValueChange}
						/>
				}
			</div>
		);
	}
}
