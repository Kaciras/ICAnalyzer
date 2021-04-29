import React, { ChangeEvent, Dispatch, ReactNode } from "react";
import * as ssimJs from "ssim.js";
import { ButteraugliOptions, defaultButteraugliOptions } from "../../lib/similarity";
import { CheckBox, NumberInput } from "../ui";
import { MeasureOptions, Optional } from "../encode";
import styles from "./MeasurePanel.scss";

export function getMeasureOptions(saved?: MeasureOptions): MeasureOptions {
	if (saved) {
		return saved;
	}
	return {
		version: 1,
		workerCount: navigator.hardwareConcurrency,
		time: true,
		PSNR: false,
		SSIM: {
			enabled: true,
			options: ssimJs.getOptions(),
		},
		butteraugli: {
			enabled: false,
			options: defaultButteraugliOptions,
		},
	};
}

interface LabelWrapperProps {
	label: string;
	children: ReactNode;
}

function LabelWrapper(props: LabelWrapperProps) {
	const { label, children } = props;
	return (
		<label className={styles.field}>
			<span className={styles.label}>
				{label}
			</span>
			{children}
		</label>
	);
}

interface ButteraugliProps {
	value: Optional<ButteraugliOptions>;
	onChange: Dispatch<Optional<ButteraugliOptions>>;
}

function ButteraugliFields(props: ButteraugliProps) {
	const { value, onChange } = props;

	function handleChange(name: string, newValue: number) {
		const options = { ...value.options, [name]: newValue };
		onChange({ ...value, options });
	}

	const inputs = Object.entries(value.options).map(([name, value]) =>
		<LabelWrapper key={name} label={name}>
			<NumberInput
				className={styles.value}
				name={name}
				min={0}
				max={2}
				step={0.1}
				value={value}
				onValueChange={v => handleChange(name, v)}
			/>
		</LabelWrapper>,
	);

	return <fieldset className={styles.subfields}>{inputs}</fieldset>;
}

function createModel<T, R>(value: T, onChange: Dispatch<T>, ...path: string[]) {

	function deepSet(current: any, index: number, newValue: any) {
		const key = path[index];
		if (index < path.length - 1) {
			newValue = deepSet(current[key], index + 1, newValue);
		}
		return { ...current, ...newValue };
	}

	const subValue = path.reduce((parent, key) => parent[key], value as any);

	return { value: subValue, onChange: v => deepSet(value, 0, v) } as Model<R>;
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

interface Model<T> {
	value: T;
	onChange: Dispatch<Partial<T>>;
}

function SSIMOptionsSet(props: Model<ssimJs.Options>) {
	const { value, onChange } = props;

	return (
		<fieldset className={styles.subfields}>
			<LabelWrapper label="Algorithm">
				<select
					className={styles.select}
					value={value.ssim}
					onChange={e => onChange({ ssim: e.target.value as any })}
				>
					<option>fast</option>
					<option>original</option>
					<option>bezkrovny</option>
					<option>weber</option>
				</select>
			</LabelWrapper>
			<LabelWrapper label="k1">
				<NumberInput
					value={value.k1}
					min={0}
					step={0.01}
					onValueChange={k1 => onChange({ k1 })}
				/>
			</LabelWrapper>
			<LabelWrapper label="k2">
				<NumberInput
					value={value.k2}
					min={0}
					step={0.01}
					onValueChange={k2 => onChange({ k2 })}
				/>
			</LabelWrapper>
			<LabelWrapper label="window size">
				<NumberInput
					value={value.windowSize}
					min={0}
					step={0.01}
					onValueChange={windowSize => onChange({ windowSize })}
				/>
			</LabelWrapper>
		</fieldset>
	);
}

export interface MeasurePanelProps {
	encodeTime?: boolean;
	value: MeasureOptions;
	onChange: Dispatch<MeasureOptions>;
}

export default function MeasurePanel(props: MeasurePanelProps) {
	const { encodeTime, value, onChange } = props;
	const { workerCount, time, SSIM, PSNR, butteraugli } = value;

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, checked } = event.currentTarget;
		onChange({ ...value, [name]: checked });
	}

	function handleWorkerCountChange(count: number) {
		onChange({ ...value, workerCount: count });
	}

	function handleBgChange(newValue: Optional<ButteraugliOptions>) {
		onChange({ ...value, butteraugli: newValue });
	}

	return (
		<form className={styles.form} role="tabpanel">
			<label>
				<span className={styles.inlineLabel}>
					Thread count:
				</span>
				<NumberInput
					value={workerCount}
					min={1}
					step={1}
					onValueChange={handleWorkerCountChange}
				/>
			</label>

			{
				encodeTime &&
				<CheckBox
					checked={time}
					name="time"
					onChange={handleChange}
				>
					Encode time (Not very accurate)
				</CheckBox>
			}

			<CheckBox
				checked={SSIM.enabled}
				name="SSIM.enabled"
				onChange={e => onChange(deepSet(value, "SSIM.enabled", e.target.checked))}
			>
				Structural similarity index measure
			</CheckBox>
			<SSIMOptionsSet
				value={SSIM.options}
				onChange={v => onChange(deepSet(value, "SSIM.options", v))}
			/>

			<CheckBox
				checked={PSNR}
				name="PSNR"
				onChange={handleChange}
			>
				Peak signal-to-noise ratio
			</CheckBox>

			<CheckBox
				checked={butteraugli.enabled}
				name="butteraugli"
				onValueChange={v => onChange({ ...value, butteraugli: { ...butteraugli, enabled: v } })}
			>
				Butteraugli
			</CheckBox>
			<ButteraugliFields value={butteraugli} onChange={handleBgChange}/>
		</form>
	);
}
