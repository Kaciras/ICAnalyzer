import { SwitchButton } from "../ui";
import { OptionMode } from "../codecs";
import { OptionFieldProps, OptionType } from "./index";
import ModeSwitcher from "./ModeSwitcher";
import SwitchControl from "./SwitchControl";
import styles from "./SwitchControl.scss";

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

	OptionField(props: OptionFieldProps<boolean, any>) {
		const { id, label } = this.data;
		const { mode, value, onValueChange, onModeChange } = props;

		return (
			<fieldset className={styles.container}>
				<ModeSwitcher
					mode={mode}
					onChange={onModeChange}
				/>
				<span className={styles.label}>
					{label}
				</span>
				{
					mode === OptionMode.Range
						? <strong>OFF & ON</strong>
						: <SwitchButton
							name={id}
							checked={value}
							onValueChange={onValueChange}
						/>
				}
			</fieldset>
		);
	}

	populate(value: boolean, options: any) {
		options[this.data.id] = value;
	}

	generate(_: never, key: any, options: any) {
		const { id } = this.data;
		return [
			{
				key: { ...key, [id]: false },
				options: { ...options, [id]: false },
			},
			{
				key: { ...key, [id]: true },
				options: { ...options, [id]: true },
			},
		];
	}
}
