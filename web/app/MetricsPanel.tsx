import React, { ChangeEvent, Dispatch } from "react";
import * as ssimJs from "ssim.js";
import { defaultButteraugliOptions } from "../../lib/similarity";
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

	const inputs = Object.entries(value.options).map(([name, value]) =>
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
		</label>,
	);

	return (
		<div>
			<CheckBox
				checked={value.enabled}
				name="butteraugli"
				onValueChange={v => onChange({ ...value, enabled: v })}
			>
				Butteraugli
			</CheckBox>

			<fieldset className={styles.subfields}>
				{value.enabled && inputs}
			</fieldset>
		</div>
	);
}

function deepSet(target: any, path: string, value: any) {
	const parts = path.split(".");

	function recurs(current: any, index: number) {
		const key = parts[index];
		let localValue = value;
		if (index < parts.length - 1) {
			localValue = recurs(current[key], index + 1);
		}
		return { ...current, [key]: localValue };
	}

	return recurs(target, 0);
}

function deepGet(target: any, path: string) {
	return path.split(".").reduce((parent, key) => parent[key], target);
}

interface NumberOptionProps<T> {
	name: string;
	path: string
	data: T;
	min?: number;
	max?: number;
	step?: number;
	onChange: Dispatch<T>;
}

function NumberOptions<T>(props: NumberOptionProps<T>) {
	const { name, path, data, min, max, step, onChange } = props;

	function handleChange(value: number) {
		onChange(deepSet(data, path, value));
	}

	return (
		<label className={styles.field}>
			<span className={styles.label}>{name}</span>
			<NumberInput
				className={styles.value}
				min={min}
				max={max}
				step={step}
				value={deepGet(data, path)}
				onValueChange={handleChange}
			/>
		</label>
	);
}

export interface QualityFormPros {
	// value:
}

interface MetricsPanelProps {
	value: MeasureOptions;
	onChange: Dispatch<MeasureOptions>;
}

export default function MetricsPanel(props: MetricsPanelProps) {
	const { value, onChange } = props;
	const { workerCount, time, SSIM, PSNR, butteraugli } = value;

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

			<div>
				<CheckBox
					checked={SSIM.enabled}
					name="SSIM.enabled"
					onChange={e => onChange(deepSet(value, "SSIM.enabled", e.target.checked))}
				>
					Structural similarity index measure
				</CheckBox>
				<div className={styles.subfields}>
					<label className={styles.field}>
					<span className={styles.label}>
						Algorithm
					</span>
						<select
							className={styles.select}
							value={SSIM.options.ssim}
							onChange={e => onChange(deepSet(value, "SSIM.options.ssim", e.target.value))}
						>
							<option>fast</option>
							<option>original</option>
							<option>bezkrovny</option>
							<option>weber</option>
						</select>
					</label>

					<NumberOptions
						name="k1"
						path="SSIM.options.k1"
						min={0}
						step={0.01}
						data={value}
						onChange={onChange}
					/>
					<NumberOptions
						name="K2"
						path="SSIM.options.k2"
						min={0}
						step={0.01}
						data={value}
						onChange={onChange}
					/>
					<NumberOptions
						name="window size"
						path="SSIM.options.windowSize"
						min={0}
						step={1}
						data={value}
						onChange={onChange}
					/>
				</div>
			</div>

			<ButteraugliFields value={butteraugli} onChange={handleBgChange}/>
		</form>
	);
}
