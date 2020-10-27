import { MeasureOptions } from "../encoding";
import React, { ChangeEvent, Dispatch, useState } from "react";
import { defaultButteraugliOptions } from "../../lib/similarity";
import Styles from "./MetricsPanel.scss";
import NumberInput from "./NumberInput";
import CheckBoxInput from "./CheckBoxInput";

interface MProps {
	workerCount: number;
	options: MeasureOptions;
	onWorkerCountChange: Dispatch<number>;
	onMeasureChange: Dispatch<MeasureOptions>;
}

export default function MetricsPanel(props: MProps) {
	const { workerCount, onWorkerCountChange, onMeasureChange } = props;
	const { SSIM, PSNR, butteraugli } = props.options;

	const [butteraugliVal, setButteraugliVal] = useState(defaultButteraugliOptions);
	let butteraugliOptions;

	if (butteraugli) {
		const { badQualitySeek, goodQualitySeek, hfAsymmetry } = butteraugli;
		butteraugliOptions = (
			<fieldset className="subfields">
				<label className={Styles.field}>
					<span className={Styles.label}>
						hfAsymmetry
					</span>
					<NumberInput
						className={Styles.value}
						name="hfAsymmetry"
						min={0}
						step={0.1}
						value={hfAsymmetry}
					/>
				</label>
				<label className={Styles.field}>
					<span className={Styles.label}>
						badQualitySeek
					</span>
					<NumberInput
						className={Styles.value}
						name="badQualitySeek"
						min={0}
						max={2}
						step={0.1}
						value={badQualitySeek}
					/>
				</label>
				<label className={Styles.field}>
					<span className={Styles.label}>
						goodQualitySeek
					</span>
					<NumberInput
						className={Styles.value}
						name="goodQualitySeek"
						min={0}
						max={2}
						step={0.1}
						value={goodQualitySeek}
					/>
				</label>
			</fieldset>
		);
	}

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, checked } = event.currentTarget;
		const newValue = name !== "butteraugli" ? checked : checked && butteraugliVal;
		onMeasureChange({ ...props.options, [name]: newValue });
	}

	return (
		<form className={Styles.fieldset}>
			<label>
				Worker count:
				<NumberInput min={1} step={1} value={workerCount} onChange={onWorkerCountChange}/>
			</label>
			<CheckBoxInput
				checked={SSIM}
				name="SSIM"
				onChange={handleChange}
			>
				Calculate SSIM
			</CheckBoxInput>
			<CheckBoxInput
				checked={PSNR}
				name="PSNR"
				onChange={handleChange}
			>
				Calculate PSNR
			</CheckBoxInput>
			<CheckBoxInput
				checked={!!butteraugli}
				name="butteraugli"
				onChange={handleChange}
			>
				Calculate Butteraugli
			</CheckBoxInput>
			{butteraugliOptions}
		</form>
	);
}
