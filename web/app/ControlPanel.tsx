import { Dispatch, ReactNode } from "react";
import clsx from "clsx";
import { SelectBox } from "../ui";
import { getEncoderNames } from "../codecs";
import { ControlState, VariableType } from "./AnalyzePage";
import { ControlsMap } from "./index";
import styles from "./ControlPanel.scss";

interface WrapperProps {
	type: VariableType;
	targetType: VariableType;
	id: string;
	targetId: string;

	children?: ReactNode;

	onChange: Dispatch<Partial<ControlState>>;
}

function FieldWrapper(props: WrapperProps) {
	const { type, id, targetType, targetId, children, onChange } = props;

	function handleClick() {
		onChange({ varType: targetType, varId: targetId });
	}

	const clazz = clsx(
		styles.field,
		{ [styles.active]: targetType === type && targetId === id },
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
	const { varType, varId, codec, stateMap } = value;

	if (varType === VariableType.None) {
		return null;
	}

	const state = stateMap[codec];

	function handleValueChange(id: string, value: any) {
		const newStateMap = {
			...stateMap,
			[codec]: { ...state, [id]: value },
		};
		onChange({ stateMap: newStateMap });
	}

	const controls = controlsMap[codec].map(C =>
		<FieldWrapper
			key={C.id}
			type={varType}
			id={varId}
			targetType={VariableType.Option}
			targetId={C.id}
			onChange={onChange}
		>
			<C.Input
				value={state[C.id]}
				onChange={v => handleValueChange(C.id, v)}
			/>
		</FieldWrapper>,
	);

	function handleCodecChange(newCodec: string) {
		onChange({ codec: newCodec });
	}

	const selectOptions = getEncoderNames(controlsMap)
		.map(name => <option key={name} value={name}>{name}</option>);

	if (selectOptions.length > 1) {
		controls.push(
			<FieldWrapper
				type={varType}
				id={varId}
				targetType={VariableType.Encoder}
				targetId=""
				onChange={onChange}
			>
				<SelectBox
					title="Codec name"
					value={codec}
					onValueChange={handleCodecChange}
				>
					{selectOptions}
				</SelectBox>
			</FieldWrapper>,
		);
	}

	return <form className={styles.container}>{controls}</form>;
}
