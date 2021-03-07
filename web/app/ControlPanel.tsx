import { ChangeEvent, Dispatch, ReactNode, useState } from "react";
import clsx from "clsx";
import { SelectBox } from "../ui";
import { ENCODER_MAP } from "../codecs";
import { ConvertOutput } from "../encode";
import type { Result } from ".";
import style from "./ControlPanel.scss";

interface FieldProps {
	children: ReactNode;
}

function Field(props: FieldProps) {
	const { children } = props;

	const clazz = clsx(style.field);

	return (
		<div className={clazz} onClick={() => {}}>
			{children}
		</div>
	);
}

export interface ControlPanelProps {
	result: Result
	onImageChange: Dispatch<ImageData>;
	onSeriesChange: Dispatch<ConvertOutput[]>;
	onOutputChange: Dispatch<ConvertOutput>;
}

export default function ControlPanel(props: ControlPanelProps) {
	const { result, onImageChange, onSeriesChange, onOutputChange } = props;
	const { state, map, original } = result;

	const encoderMap = map.get(original!.data)!;

	const [codec, setCodec] = useState(() => encoderMap.keys().next().value);

	const selectOptions = Object.entries(encoderMap).map(e => {
		const [name, outputMap] = e;
		return <option key={name} value={name}>{name}</option>;
	});

	function handleCodecChange(e: ChangeEvent<HTMLSelectElement>) {
		setCodec(e.currentTarget.value);
	}

	function handleSeriesChange(options: any[]) {
		const e = encoderMap.get(codec)!;
		onSeriesChange(options.map(o => e.get(JSON.stringify(o))!));
	}

	const Encoder = ENCODER_MAP[codec];

	return (
		<div className={style.variableGroup}>
			<Encoder.Controls
				state={state[codec]}
				onChange={options => onOutputChange(encoderMap.get(codec)!.get(JSON.stringify(options))!)}
				onSeriesChange={handleSeriesChange}
			/>
			{
				selectOptions.length > 1 &&
				<Field>
					<SelectBox
						value={codec}
						onChange={handleCodecChange}
					>
						{selectOptions}
					</SelectBox>
				</Field>
			}
			{ /* TODO: Preprocessors */}
		</div>
	);
}
