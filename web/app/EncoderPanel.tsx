import { Dispatch, useState } from "react";
import clsx from "clsx";
import { TabPanelBase } from "../ui/TabSwitch";
import { CheckBox } from "../ui";
import { OptionMode, OptionStateMap } from "../form";
import { ENCODER_MAP, ENCODERS } from "../codecs";
import styles from "./EncoderPanel.scss";

export interface EncoderConfig {
	enable: boolean;
	state: OptionStateMap;
}

export type EncodingOptions = Record<string, EncoderConfig>;

export function getEncodingOptions(saved?: EncodingOptions) {
	const config = saved ?? {};

	for (const { name, optionsGenerator } of ENCODERS) {
		config[name] ??= {
			enable: false,
			state: optionsGenerator.newState(),
		};
	}
	if (!saved) {
		const { quality } = config.WebP.state;
		config.WebP.enable = true;
		quality.range.step = 5;
		quality.mode = OptionMode.Range;
	}
	return config;
}

export interface EncoderPanelProps extends TabPanelBase {
	value: Record<string, EncoderConfig>;
	onChange: Dispatch<Record<string, EncoderConfig>>;
}

export default function EncoderPanel(props: EncoderPanelProps) {
	const { isActive, value, onChange } = props;

	const [current, setCurrent] = useState("WebP");

	if (isActive === false) {
		return null;
	}

	const tabs = ENCODERS.map(({ name }) => {
		const classes = clsx(
			styles.tab,
			{ [styles.active]: name === current },
		);

		function handleEnableChange(enable: boolean) {
			const x = { ...value[name], enable };
			onChange({ ...value, [name]: x });
		}

		return (
			<button
				className={classes}
				key={name}
				onClick={() => setCurrent(name)}
			>
				<CheckBox
					checked={value[name].enable}
					onClick={e => e.stopPropagation()}
					onCheckedChange={handleEnableChange}
				/>
				<span className={styles.name}>{name}</span>
			</button>
		);
	});

	function handleOptionChange(newState: any) {
		const c = { ...value[current], state: newState };
		onChange({ ...value, [current]: c });
	}

	const { OptionsList } = ENCODER_MAP[current].optionsGenerator;

	return (
		<div className={styles.container} role="tabpanel">
			<div className={styles.tablist}>
				{tabs}
			</div>
			<OptionsList
				className={styles.form}
				state={value[current].state}
				onChange={handleOptionChange}
			/>
		</div>
	);
}
