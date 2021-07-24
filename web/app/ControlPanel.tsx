import { ChangeEvent, Dispatch, ReactNode } from "react";
import clsx from "clsx";
import { SelectBox } from "../ui";
import { ENCODERS } from "../codecs";
import { ControlState, VariableType } from "./AnalyzePage";
import { ControlsMap } from "./index";
import styles from "./ControlPanel.scss";

interface WrapperProps {
	type: VariableType;
	targetType: VariableType;
	name: string;
	targetName: string;

	children?: ReactNode;

	onChange: Dispatch<Partial<ControlState>>;
}

function FieldWrapper(props: WrapperProps) {
	const { type, name, targetType, targetName, children, onChange } = props;

	function handleClick() {
		onChange({ varType: targetType, varName: targetName });
	}

	const clazz = clsx(
		styles.field,
		{ [styles.active]: targetType === type && targetName === name },
	);

	return <div className={clazz} onClick={handleClick}>{children}</div>;
}

export interface ControlPanelProps {
	controlsMap: ControlsMap;
	value: ControlState;
	onChange: Dispatch<Partial<ControlState>>;
}

export default function ControlPanel(props: ControlPanelProps) {
	const { controlsMap, value, onChange } = props;
	const { varType, varName, encoderName, stateMap } = value;

	if (varType === VariableType.None) {
		return null;
	}

	function handleCodecChange(e: ChangeEvent<HTMLSelectElement>) {
		onChange({ encoderName: e.currentTarget.value });
	}

	function handleValueChange(id: string, newValue: any) {
		const key = stateMap[encoderName];
		const es = { ...stateMap, [encoderName]: { ...key, [id]: newValue } };
		onChange({ stateMap: es });
	}

	const selectOptions = ENCODERS
		.filter(e => e.name in controlsMap)
		.map(({ name }) => <option key={name} value={name}>{name}</option>);

	const state = stateMap[encoderName];
	const controls = controlsMap[encoderName].map(C =>
		<FieldWrapper
			key={C.id}
			type={varType}
			name={varName}
			targetType={VariableType.Option}
			targetName={C.id}
			onChange={onChange}
		>
			<C.Input
				value={state[C.id]}
				onChange={v => handleValueChange(C.id, v)}
			/>
		</FieldWrapper>,
	);

	if (selectOptions.length > 1) {
		controls.push(
			<FieldWrapper
				type={varType}
				name={varName}
				targetType={VariableType.Encoder}
				targetName=""
				onChange={onChange}
			>
				<SelectBox
					title="Codec name"
					value={encoderName}
					onChange={handleCodecChange}
				>
					{selectOptions}
				</SelectBox>
			</FieldWrapper>,
		);
	}

	return <form className={styles.container}>{controls}</form>;
}
