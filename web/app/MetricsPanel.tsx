import React, { ChangeEvent, Dispatch } from "react";
import * as ssimJs from "ssim.js";
import { defaultButteraugliOptions, SSIMOptions } from "../../lib/similarity";
import { CheckBox, NumberInput } from "../ui";
import { ButteraugliConfig, MeasureOptions, Optional } from "../encode";
import styles from "./MetricsPanel.scss";

export function createMeasureState(saved?: MeasureOptions): MeasureOptions {
	if (saved) {
		return saved;
	}
	return {
		version: 1,
		workerCount: navigator.hardwareConcurrency,
		time: true,
		PSNR: true,
		SSIM: {
			enabled: false,
			options: ssimJs.getOptions(),
		},
		butteraugli: {
			enabled: false,
			options: defaultButteraugliOptions,
		},
	};
}

interface ButteraugliProps {
	value: Optional<ButteraugliConfig>;
	onChange: Dispatch<Optional<ButteraugliConfig>>;
}

function ButteraugliFields(props: ButteraugliProps) {
	const { value, onChange } = props;

	function handleChange(name: string, newValue: number) {
		const options = { ...value.options, [name]: newValue };
		onChange({ ...value, options });
	}

	const inputs = Object.entries(value.options).map(([name, value]) => (
		<label
			className={styles.field}
			key={name}
		>
			<span className={styles.label}>
				{name}
			</span>
			<NumberInput
				className={styles.value}
				name={name}
				min={0}
				max={2}
				step={0.1}
				value={value}
				onValueChange={v => handleChange(name, v)}
			/>
		</label>
	));

	return (
		<div>
			<CheckBox
				checked={value.enabled}
				name="butteraugli"
				onValueChange={v => onChange({ ...value, enabled: v })}
			>
				Butteraugli
			</CheckBox>

			<fieldset className="subfields">
				{value.enabled && inputs}
			</fieldset>
		</div>
	);
}

interface SSIMProps {
	options: SSIMOptions;
	onChange: Dispatch<SSIMOptions>;
}

function SSIMFields(props: SSIMProps) {
	return (
		<></>
	);
}

interface MetricsPanelProps {
	value: MeasureOptions;
	onChange: Dispatch<MeasureOptions>;
}

export default function MetricsPanel(props: MetricsPanelProps) {
	const { value, onChange } = props;
	const { workerCount,time, SSIM, PSNR, butteraugli } = value;

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, checked } = event.currentTarget;
		onChange({ ...value, [name]: checked });
	}

	function handleWorkerCountChange(count: number) {
		onChange({ ...value, workerCount: count });
	}

	function handleBgChange(newValue: Optional<ButteraugliConfig>) {
		onChange({ ...value, butteraugli: newValue });
	}

	return (
		<form className={styles.form} role="tabpanel">
			<label>
				<span className={styles.inlineLabel}>
					Worker count:
				</span>
				<NumberInput
					value={workerCount}
					min={1}
					step={1}
					onValueChange={handleWorkerCountChange}
				/>
			</label>
			<CheckBox
				checked={time}
				name="time"
				onChange={handleChange}
			>
				Encode time (Not very accurate)
			</CheckBox>
			<CheckBox
				checked={PSNR}
				name="PSNR"
				onChange={handleChange}
			>
				Peak signal-to-noise ratio
			</CheckBox>
			<CheckBox
				checked={SSIM.enabled}
				name="SSIM"
				onChange={handleChange}
			>
				Structural similarity index measure
			</CheckBox>

			<ButteraugliFields value={butteraugli} onChange={handleBgChange}/>
		</form>
	);
}
