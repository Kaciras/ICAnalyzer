import { ChangeEvent, ReactNode, useCallback } from "react";
import * as ssimJs from "ssim.js";
import { defaultButteraugliOptions } from "../../lib/similarity.ts";
import { deepUpdate, Mutator } from "../mutation.ts";
import { CheckBox, NumberInput } from "../ui/index.ts";
import { TabPanelBase } from "../ui/TabSwitch.tsx";
import { MeasureOptions } from "../features/measurement.ts";
import styles from "./MeasurePanel.scss";
import i18n from "../i18n.ts";

export function getMeasureOptions(saved?: MeasureOptions) {
	if (saved) {
		return saved;
	}
	return {
		version: 1,
		workerCount: navigator.hardwareConcurrency,

		encodeTime: {
			enabled: false,
		},
		SSIM: {
			enabled: true,
			options: ssimJs.getOptions(),
		},
		PSNR: {
			enabled: false,
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

type InputTypes = HTMLInputElement | HTMLSelectElement;

// Cannot use InputTypes for el as `Element.tagName` is not a literal.
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
	hasEncodePhase?: boolean;
	value: MeasureOptions;
	onChange: Mutator<MeasureOptions>;
}

export default function MeasurePanel(props: MeasurePanelProps) {
	const { isActive, hasEncodePhase, value, onChange } = props;
	const { workerCount, encodeTime, SSIM, PSNR, butteraugli } = value;

	let handleChange = (event: ChangeEvent<InputTypes>) => {
		const { currentTarget } = event;
		const newValue = detectInputValue(currentTarget);
		deepUpdate(onChange, currentTarget.name, newValue);
	};

	handleChange = useCallback(handleChange, []);

	if (isActive === false) {
		return null;
	}

	return (
		<form className={styles.form} role="tabpanel">
			<label>
				<span className={styles.inlineLabel}>
					{i18n("ThreadCount")}:
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
				hasEncodePhase &&
				<CheckBox
					checked={encodeTime.enabled}
					name="encodeTime.enabled"
					onChange={handleChange}
				>
					{i18n("MeasureEncodeTime")}:
				</CheckBox>
			}

			<CheckBox
				checked={PSNR.enabled}
				name="PSNR.enabled"
				onChange={handleChange}
			>
				{i18n("MeasurePSNR")}
			</CheckBox>

			<CheckBox
				checked={SSIM.enabled}
				name="SSIM.enabled"
				onChange={handleChange}
			>
				{i18n("MeasureSSIM")}
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
						min={1}
						step={1}
						onChange={handleChange}
					/>
				</LabelWrapper>
			</fieldset>

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
