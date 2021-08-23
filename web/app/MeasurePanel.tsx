import { ChangeEvent, Dispatch, ReactNode, SetStateAction } from "react";
import * as ssimJs from "ssim.js";
import { defaultButteraugliOptions } from "../../lib/similarity";
import { CheckBox, NumberInput } from "../ui";
import { TabPanelBase } from "../ui/TabSwitch";
import { MeasureOptions } from "../analyzing";
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

function deepUpdate<T>(updater: Dispatch<SetStateAction<T>>, path: string, value: any) {
	const parts = path.split(".");

	function recurs(current: any, index: number) {
		const key = parts[index];
		let localValue = value;
		if (index < parts.length - 1) {
			localValue = recurs(current[key], index + 1);
		}
		return { ...current, [key]: localValue };
	}

	return updater(current => recurs(current, 0));
}

function detectInputValue(el: any) {
	switch (el.tagName) {
		case "SELECT":
			return el.value;
	}
	switch (el.type) {
		case "number":
			return el.valueAsNumber;
		case "checkbox":
			return el.checked;
		default:
			return el.value;
	}
}

export interface MeasurePanelProps extends TabPanelBase {
	encodeTime?: boolean;
	value: MeasureOptions;
	onChange: Dispatch<SetStateAction<MeasureOptions>>;
}

export default function MeasurePanel(props: MeasurePanelProps) {
	const { isActive, encodeTime, value, onChange } = props;
	const { workerCount, time, SSIM, PSNR, butteraugli } = value;

	if (isActive === false) {
		return null;
	}

	function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
		const { currentTarget } = event;
		const newValue = detectInputValue(currentTarget);
		deepUpdate(onChange, currentTarget.name, newValue);
	}

	return (
		<form className={styles.form} role="tabpanel">
			<label>
				<span className={styles.inlineLabel}>
					Thread count:
				</span>
				<NumberInput
					name="workerCount"
					value={workerCount}
					min={1}
					step={1}
					onChange={handleChange}
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
				onChange={handleChange}
			>
				Structural similarity index measure
			</CheckBox>
			<fieldset className={styles.subfields}>
				<LabelWrapper label="Algorithm">
					<select
						name="SSIM.options.ssim"
						value={SSIM.options.ssim}
						className={styles.select}
						onChange={handleChange}
					>
						<option>fast</option>
						<option>original</option>
						<option>bezkrovny</option>
						<option>weber</option>
					</select>
				</LabelWrapper>
				<LabelWrapper label="k1">
					<NumberInput
						name="SSIM.options.k1"
						value={SSIM.options.k1}
						min={0}
						step={0.01}
						onChange={handleChange}
					/>
				</LabelWrapper>
				<LabelWrapper label="k2">
					<NumberInput
						name="SSIM.options.k2"
						value={SSIM.options.k2}
						min={0}
						step={0.01}
						onChange={handleChange}
					/>
				</LabelWrapper>
				<LabelWrapper label="window size">
					<NumberInput
						name="SSIM.options.windowSize"
						value={SSIM.options.windowSize}
						min={0}
						step={1}
						onChange={handleChange}
					/>
				</LabelWrapper>
			</fieldset>

			<CheckBox
				checked={PSNR}
				name="PSNR"
				onChange={handleChange}
			>
				Peak signal-to-noise ratio
			</CheckBox>

			<CheckBox
				name="butteraugli.enabled"
				checked={butteraugli.enabled}
				onChange={handleChange}
			>
				Butteraugli
			</CheckBox>
			<fieldset className={styles.subfields}>
				<LabelWrapper label="hf-asymmetry">
					<NumberInput
						name="butteraugli.options.hfAsymmetry"
						value={butteraugli.options.hfAsymmetry}
						min={0}
						max={2}
						step={0.1}
						onChange={handleChange}
					/>
				</LabelWrapper>
				<LabelWrapper label="goodQualitySeek">
					<NumberInput
						name="butteraugli.options.goodQualitySeek"
						value={butteraugli.options.goodQualitySeek}
						min={0}
						max={2}
						step={0.1}
						onChange={handleChange}
					/>
				</LabelWrapper>
				<LabelWrapper label="badQualitySeek">
					<NumberInput
						name="butteraugli.options.badQualitySeek"
						value={butteraugli.options.badQualitySeek}
						min={0}
						max={2}
						step={0.1}
						onChange={handleChange}
					/>
				</LabelWrapper>
			</fieldset>
		</form>
	);
}
