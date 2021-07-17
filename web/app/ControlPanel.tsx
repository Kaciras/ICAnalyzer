import { ChangeEvent, Dispatch } from "react";
import { ControlField, SelectBox } from "../ui";
import { ENCODERS } from "../codecs";
import { ControlState, Step } from "./AnalyzePage";
import { ControlsMap } from "./index";
import styles from "./ControlPanel.scss";

export interface ControlPanelProps {
	controlsMap: ControlsMap;
	value: ControlState;
	onChange: Dispatch<Partial<ControlState>>;
}

export default function ControlPanel(props: ControlPanelProps) {
	const { controlsMap, value, onChange } = props;
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

	function handleValueChange(id: string, newValue: any) {
		const key = encoderState[encoderName];
		const es = { ...encoderState, [encoderName]: { ...key, [id]: newValue } };
		onChange({ encoderState: es });
	}

	const selectOptions = ENCODERS
		.filter(e => e.name in controlsMap)
		.map(({ name }) => <option key={name} value={name}>{name}</option>);

	const state = encoderState[encoderName];
	const controls = controlsMap[encoderName].map(C =>
		<C.Input
			value={state[C.id]}
			active={variableType === Step.Option && variableName === C.id}
			key={C.id}
			onChange={v => handleValueChange(C.id, v)}
			onFocus={() => handleVarChange(Step.Option, C.id)}
		/>,
	);

	return (
		<form className={styles.variableGroup}>
			{controls}
			{
				selectOptions.length > 1 &&
				<ControlField
					active={variableType === Step.Encoder}
					onFocus={() => handleVarChange(Step.Encoder, "Encoder")}
				>
					<SelectBox
						title="Codec name"
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
