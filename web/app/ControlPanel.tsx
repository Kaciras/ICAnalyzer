import { ChangeEvent, Dispatch } from "react";
import { SelectBox } from "../ui";
import { ENCODER_MAP } from "../codecs";
import { AnalyzeConfig } from "./ConfigDialog";
import { ControlState, Step } from "./AnalyzePage";
import styles from "./ControlPanel.scss";

export interface ControlPanelProps {
	config: AnalyzeConfig;
	value: ControlState
	onChange: Dispatch<ControlState>;
}

export default function ControlPanel(props: ControlPanelProps) {
	const { config, value, onChange } = props;
	const { variableType, variableName, encoderName, encoderState } = value;

	if (variableType === Step.None) {
		return null;
	}

	function handleCodecChange(e: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...value, encoderName: e.currentTarget.value });
	}

	function handleVarChange(variableType: Step, variableName: string) {
		onChange({ ...value, variableType, variableName });
	}

	function handleValueChange(values: Record<string, unknown>) {
		const { varNames, ranges } = encoderState[encoderName];
		const es = { ...encoderState, [encoderName]: { varNames, values, ranges } };
		onChange({ ...value, encoderState: es });
	}

	const Encoder = ENCODER_MAP[encoderName];
	const selectOptions = Object.keys(config.encoders).map(n => <option key={n} value={n}>{n}</option>);

	return (
		<div className={styles.variableGroup}>
			<Encoder.Controls
				state={encoderState[encoderName]}
				variableName={variableType === Step.Options && variableName}
				onChange={handleValueChange}
				onVariableChange={name => handleVarChange(Step.Options, name)}
			/>
			{
				selectOptions.length > 1 &&
				<div
					className={styles.field}
					onClick={() => handleVarChange(Step.Encoder, "")}
				>
					<SelectBox
						value={encoderName}
						onChange={handleCodecChange}
					>
						{selectOptions}
					</SelectBox>
				</div>
			}
		</div>
	);
}
