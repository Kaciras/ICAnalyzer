import { ChangeEvent, Dispatch, useState } from "react";
import clsx from "clsx";
import { CheckBox } from "../ui";
import { ENCODER_MAP, ENCODERS, EncoderState } from "../codecs";
import styles from "./EncoderPanel.scss";

export interface EncoderConfig {
	enable: boolean;
	state: EncoderState;
}

export type EncodingConfig = Record<string, EncoderConfig>;

export function createEncodingConfig(saved?: EncodingConfig): EncodingConfig {
	if (saved) {
		return saved;
	}
	const encoders: Record<string, EncoderConfig> = {};
	for (const e of ENCODERS) {
		encoders[e.name] = {
			enable: false,
			state: e.getDefaultOptions(),
		};
	}
	encoders.WebP.enable = true;
	return encoders;
}

export interface EncoderPanelProps {
	value: Record<string, EncoderConfig>;
	onChange: Dispatch<Record<string, EncoderConfig>>;
}

export default function EncoderPanel(props: EncoderPanelProps) {
	const { value, onChange } = props;

	const [current, setCurrent] = useState("WebP");

	const menuItems = ENCODERS.map(e => {
		const { name } = e;

		const classes = clsx(
			styles.menuItem,
			{ [styles.active]: name === current },
		);

		function handleEnableChange(e: ChangeEvent<HTMLInputElement>) {
			const x = { ...value[name], enable: e.currentTarget.checked };
			onChange({ ...value, [name]: x });
		}

		return (
			<div
				className={classes}
				key={name}
				tabIndex={0}
				onClick={() => setCurrent(name)}
			>
				<CheckBox
					checked={value[name].enable}
					onChange={handleEnableChange}
				/>
				<span className={styles.name}>{name}</span>
			</div>
		);
	});

	function handleOptionChange(newState: any) {
		const c = { ...value[current], state: newState };
		onChange({ ...value, [current]: c });
	}

	const { OptionsPanel } = ENCODER_MAP[current];

	return (
		<div className={styles.container}>
			<div className={styles.menu}>
				{menuItems}
			</div>
			<div className={styles.optionsPanel}>
				<OptionsPanel
					state={value[current].state}
					onChange={handleOptionChange}
				/>
			</div>
		</div>
	);
}
