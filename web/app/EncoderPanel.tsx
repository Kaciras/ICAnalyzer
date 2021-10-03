import { useState } from "react";
import clsx from "clsx";
import { TabPanelBase } from "../ui/TabSwitch";
import { Merger } from "../mutation";
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
	value: EncodingOptions;
	onChange: Merger<EncodingOptions>;
}

export default function EncoderPanel(props: EncoderPanelProps) {
	const { isActive, value, onChange } = props;

	const [current, setCurrent] = useState("WebP");

	const tabs = ENCODERS.map(({ name }) => {
		const classes = clsx(
			styles.tab,
			{ [styles.active]: name === current },
		);

		const handleEnableChange = onChange.sub(name).sub("enable");

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

	const { OptionsList } = ENCODER_MAP[current].optionsGenerator;

	// EncoderPanel is expensive to render, so we just hide it when inactive.
	const classes = clsx(
		styles.container,
		isActive === false && "hidden",
	);

	return (
		<div className={classes} role="tabpanel">
			<div className={styles.tablist}>
				{tabs}
			</div>
			<OptionsList
				className={styles.form}
				state={value[current].state}
				onChange={onChange.sub(current).sub("state")}
			/>
		</div>
	);
}
