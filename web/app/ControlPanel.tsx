import { Dispatch, ReactNode } from "react";
import clsx from "clsx";
import { SelectBox } from "../ui/index.ts";
import i18n from "../i18n.ts";
import { getEncoderNames } from "../codecs/index.ts";
import { Merger } from "../hooks.ts";
import { ControlsMap } from "./index.ts";
import { ControlState, VariableType } from "./AnalyzePage.tsx";
import styles from "./ControlPanel.scss";

interface FieldWrapperProps {
	type: VariableType;
	targetType: VariableType;
	id: string;
	targetId: string;

	children?: ReactNode;

	onChange: Dispatch<Partial<ControlState>>;
}

function FieldWrapper(props: FieldWrapperProps) {
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
	onChange: Merger<ControlState>;
}

export default function ControlPanel(props: ControlPanelProps) {
	const { controlsMap, value, onChange } = props;
	const { varType, varId, codec, stateMap } = value;

	if (varType === VariableType.None) {
		return null;
	}

	const state = stateMap[codec];
	const setState = onChange.sub("stateMap").sub(codec);

	const controls = controlsMap[codec].map(({ id, Input }, i) =>
		<FieldWrapper
			key={id}
			type={varType}
			id={varId}
			targetType={VariableType.Option}
			targetId={id}
			onChange={onChange.merge}
		>
			<Input
				value={state[i]}
				onChange={setState.sub(i)}
			/>
		</FieldWrapper>,
	);

	const selectOptions = getEncoderNames(controlsMap)
		.map(name => <option key={name} value={name}>{name}</option>);

	if (selectOptions.length > 1) {
		controls.push(
			<FieldWrapper
				key="codec"
				type={varType}
				id={varId}
				targetType={VariableType.Encoder}
				targetId=""
				onChange={onChange.merge}
			>
				<SelectBox
					title={i18n("Codec")}
					value={codec}
					onValueChange={onChange.sub("codec")}
				>
					{selectOptions}
				</SelectBox>
			</FieldWrapper>,
		);
	}

	return <form className={styles.container}>{controls}</form>;
}
