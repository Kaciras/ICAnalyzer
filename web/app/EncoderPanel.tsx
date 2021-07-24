import { ChangeEvent, Dispatch, useState } from "react";
import clsx from "clsx";
import { CheckBox } from "../ui";
import { ENCODER_MAP, ENCODERS, EncoderState } from "../codecs";
import styles from "./EncoderPanel.scss";

export interface EncoderConfig {
	enable: boolean;
	state: EncoderState;
}

export type EncodingOptions = Record<string, EncoderConfig>;

export function getEncodingOptions(saved?: EncodingOptions) {
	const config = saved ?? {};

	for (const { name, getState } of ENCODERS) {
		if (config[name]) {
			config[name].state = getState(config[name].state);
		} else {
			config[name] = { enable: false, state: getState() };
		}
	}
	if (!saved) {
		config.WebP.enable = true;
	}
	return config;
}

export interface EncoderPanelProps {
	value: Record<string, EncoderConfig>;
	onChange: Dispatch<Record<string, EncoderConfig>>;
}

export default function EncoderPanel(props: EncoderPanelProps) {
	const { value, onChange } = props;

	const [current, setCurrent] = useState("WebP");

	const tabs = ENCODERS.map(({ name }) => {
		const classes = clsx(
			styles.tab,
			{ [styles.active]: name === current },
		);

		function handleEnableChange(e: ChangeEvent<HTMLInputElement>) {
			const x = { ...value[name], enable: e.currentTarget.checked };
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
					onChange={handleEnableChange}
				/>
				<span className={styles.name}>{name}</span>
			</button>
		);
	});

	function handleOptionChange(newState: any) {
		const c = { ...value[current], state: newState };
		onChange({ ...value, [current]: c });
	}

	const { OptionsPanel } = ENCODER_MAP[current];

	return (
		<div className={styles.container} role="tabpanel">
			<div className={styles.tablist}>
				{tabs}
			</div>
			<form className={styles.form}>
				<OptionsPanel
					state={value[current].state}
					onChange={handleOptionChange}
				/>
			</form>
		</div>
	);
}
