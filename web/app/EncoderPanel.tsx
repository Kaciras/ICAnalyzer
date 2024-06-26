import React, { useState } from "react";
import clsx from "clsx";
import { TabPanelBase } from "../ui/TabSwitch.tsx";
import { CheckBox } from "../ui/index.ts";
import { stopPropagation } from "../utils.ts";
import { OptionStateMap } from "../form/index.ts";
import { ENCODER_MAP, ENCODERS, ImageEncoder } from "../codecs/index.ts";
import styles from "./EncoderPanel.scss";
import OptionsForm from "../form/OptionsForm.tsx";
import { Merger } from "../hooks.ts";

export interface EncoderConfig {
	enable: boolean;
	state: OptionStateMap;
}

export type EncodingOptions = Record<string, EncoderConfig>;

function newState(encoder: ImageEncoder) {
	const state: OptionStateMap = {};

	for (const t of encoder.templates) {
		const [value, range] = t.createState();
		state[t.id] = { value, range, isVariable: false };
	}
	return state;
}

export function getEncodingOptions(saved?: EncodingOptions) {
	const config = saved ?? {};

	for (const encoder of ENCODERS) {
		config[encoder.name] ??= {
			enable: false,
			state: newState(encoder),
		};
	}
	if (!saved) {
		const { quality } = config.WebP.state;
		config.WebP.enable = true;
		quality.range.step = 5;
		quality.isVariable = true;
	}
	return config;
}

export interface EncoderPanelProps extends TabPanelBase {
	value: EncodingOptions;
	onChange: Merger<EncodingOptions>;
}

function EncoderPanel(props: EncoderPanelProps) {
	const { isActive, value, onChange } = props;

	const [current, setCurrent] = useState("WebP");

	const tabs = ENCODERS.map(({ name }) => {
		const classes = clsx(
			styles.tab,
			name === current && styles.active,
		);

		const handleEnableChange = onChange.sub(name).sub("enable");

		return (
			<button
				className={classes}
				key={name}
				type="button"
				onClick={() => setCurrent(name)}
			>
				<CheckBox
					checked={value[name].enable}
					onClick={stopPropagation}
					onCheckedChange={handleEnableChange}
				/>
				<span className={styles.name}>{name}</span>
			</button>
		);
	});

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
			<OptionsForm
				templates={ENCODER_MAP[current].templates}
				className={styles.form}
				state={value[current].state}
				onChange={onChange.sub(current).sub("state")}
			/>
		</div>
	);
}

export default React.memo(EncoderPanel);
