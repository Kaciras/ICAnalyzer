import React from "react";
import ResetIcon from "bootstrap-icons/icons/arrow-counterclockwise.svg";
import { Mutator } from "../mutation.ts";
import { PinchZoomState } from "./PinchZoom.tsx";
import { Button, NumberInput } from "./index.ts";
import styles from "./ZoomControl.scss";

export interface ZoomControlProps {
	className?: string;
	initValue?: PinchZoomState;
	value: PinchZoomState;
	onChange: Mutator<PinchZoomState>;
}

function ZoomControl(props: ZoomControlProps) {
	const { className, initValue, value, onChange } = props;

	function setZoom(value: number) {
		onChange(prev => ({ ...prev, scale: value / 100 }));
	}

	return (
		<div className={className}>
			<NumberInput
				title="Zoom scale"
				min={25}
				step={1}
				increment={25}
				className={styles.zoomInput}
				value={Math.round(value.scale * 100)}
				onValueChange={setZoom}
			/>
			{
				initValue &&
				<Button
					title="Reset view"
					type="text"
					className={styles.button}
					onClick={() => onChange(initValue)}
				>
					<ResetIcon/>
				</Button>
			}
		</div>
	);
}

export default React.memo(ZoomControl);
