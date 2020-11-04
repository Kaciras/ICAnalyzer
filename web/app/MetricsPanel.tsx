import { ButteraugliConfig, MeasureOptions } from "../encode";
import React, { ChangeEvent, Dispatch, useRef, useState } from "react";
import { defaultButteraugliOptions } from "../../lib/similarity";
import Styles from "./MetricsPanel.scss";
import { CheckBox, NumberInput } from "../ui";

interface MProps {
	workerCount: number;
	options: MeasureOptions;
	onWorkerCountChange: Dispatch<number>;
	onMeasureChange: Dispatch<MeasureOptions>;
}

interface ButteraugliProps {
	options: ButteraugliConfig;
	onChange: Dispatch<ButteraugliConfig>;
}

function ButteraugliFields(props: ButteraugliProps) {
	const { options, onChange } = props;

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, valueAsNumber } = event.currentTarget;
		onChange({ ...options, [name]: valueAsNumber });
	}

	const inputs = Object.entries(options).map(([name, value]) => (
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

	return <fieldset className="subfields">{inputs}</fieldset>;
}

export default function MetricsPanel(props: MProps) {
	const { workerCount, onWorkerCountChange, onMeasureChange } = props;
	const { time, SSIM, PSNR, butteraugli } = props.options;

	const [butteraugliVal, setButteraugliVal] = useState<ButteraugliConfig>(defaultButteraugliOptions);

	let butteraugliFields = null;
	if (butteraugli) {
		butteraugliFields = <ButteraugliFields options={butteraugliVal} onChange={setButteraugliVal}/>;
	}

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, checked } = event.currentTarget;
		const newValue = name !== "butteraugli" ? checked : checked && butteraugliVal;
		onMeasureChange({ ...props.options, [name]: newValue });
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
					onChange={e => onWorkerCountChange(e.target.valueAsNumber)}
				/>
			</label>
			<CheckBox
				checked={SSIM}
				name="SSIM"
				onChange={handleChange}
			>
				Calculate SSIM
			</CheckBox>
			<CheckBox
				checked={PSNR}
				name="PSNR"
				onChange={handleChange}
			>
				Calculate PSNR
			</CheckBox>
			<CheckBox
				checked={!!butteraugli}
				name="butteraugli"
				onChange={handleChange}
			>
				Calculate Butteraugli
			</CheckBox>
			{butteraugliFields}
		</form>
	);
}
