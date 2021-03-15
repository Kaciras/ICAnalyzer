import { ButteraugliConfig, MeasureOptions, Optional } from "../encode";
import React, { ChangeEvent, Dispatch } from "react";
import { defaultButteraugliOptions } from "../../lib/similarity";
import Styles from "./MetricsPanel.scss";
import { CheckBox, NumberInput } from "../ui";
import * as ssimJs from "ssim.js";

export function createMeansureState(saved?: MeasureOptions): MeasureOptions {
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

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, valueAsNumber } = event.currentTarget;
		onChange({ ...value, [name]: valueAsNumber });
	}

	const inputs = Object.entries(value.options).map(([name, value]) => (
		<label
			className={Styles.field}
			key={name}
		>
			<span className={Styles.label}>
				{name}
			</span>
			<NumberInput
				className={Styles.value}
				name={name}
				min={0}
				step={0.1}
				value={value}
				onChange={handleChange}
			/>
		</label>
	));

	return (
		<fieldset>
			<CheckBox
				checked={value.enabled}
				name="butteraugli"
				onValueChange={v => onChange({ ...value, enabled: v })}
			>
				Calculate Butteraugli
			</CheckBox>

			<div className="subfields">
				{value.enabled && inputs}
			</div>
		</fieldset>
	);
}

interface SSIMProps {
	options: ButteraugliConfig;
	onChange: Dispatch<ButteraugliConfig>;
}

function SSIMFields() {

}

interface MetricsPanelProps {
	value: MeasureOptions;
	onChange: Dispatch<MeasureOptions>;
}

export default function MetricsPanel(props: MetricsPanelProps) {
	const { value, onChange } = props;
	const { workerCount, SSIM, PSNR, butteraugli } = value;

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
		<form className={Styles.form}>
			<label>
				<span className={Styles.inlineLabel}>
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
				checked={PSNR}
				name="PSNR"
				onChange={handleChange}
			>
				Calculate PSNR
			</CheckBox>
			<CheckBox
				checked={SSIM.enabled}
				name="SSIM"
				onChange={handleChange}
			>
				Calculate SSIM
			</CheckBox>

			<ButteraugliFields value={butteraugli} onChange={handleBgChange}/>
		</form>
	);
}
