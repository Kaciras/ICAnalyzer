import { ChangeEvent, Dispatch } from "react";
import { ControlField, SelectBox } from "../ui";
import { ENCODER_MAP, ENCODERS } from "../codecs";
import { AnalyzeConfig } from "./ConfigDialog";
import { ControlState, Step } from "./AnalyzePage";
import styles from "./ControlPanel.scss";

export interface ControlPanelProps {
	config: AnalyzeConfig;
	value: ControlState
	onChange: Dispatch<Partial<ControlState>>;
}

export default function ControlPanel(props: ControlPanelProps) {
	const { config, value, onChange } = props;
	const { variableType, variableName, encoderName, encoderState } = value;

	if (variableType === Step.None) {
		return null;
	}

	function handleCodecChange(e: ChangeEvent<HTMLSelectElement>) {
		onChange({ encoderName: e.currentTarget.value });
	}

	function handleVarChange(variableType: Step, variableName: string) {
		onChange({ variableType, variableName });
	}

	function handleValueChange(values: Record<string, unknown>) {
		const { varNames, ranges, labels } = encoderState[encoderName];
		const es = { ...encoderState, [encoderName]: { varNames, values, ranges, labels } };
		onChange({ encoderState: es });
	}

	const Encoder = ENCODER_MAP[encoderName];
	const selectOptions = ENCODERS.filter(e => config.encoders[e.name].enable)
		.map(({ name }) => <option key={name} value={name}>{name}</option>);

	return (
		<form className={styles.variableGroup}>
			<Encoder.Controls
				state={encoderState[encoderName]}
				variableName={variableType === Step.Options && variableName}
				onChange={handleValueChange}
				onVariableChange={name => handleVarChange(Step.Options, name)}
			/>
			{
				selectOptions.length > 1 &&
				<ControlField
					active={variableType === Step.Encoder}
					onFocus={() => handleVarChange(Step.Encoder, "Encoder")}
				>
					<SelectBox
						value={encoderName}
						onChange={handleCodecChange}
					>
						{selectOptions}
					</SelectBox>
				</ControlField>
			}
		</form>
	);
}
