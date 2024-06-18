import React from "react";
import { BsArrowCounterclockwise } from "react-icons/bs";
import { Mutator } from "../mutation.ts";
import { PinchZoomState } from "./PinchZoom.tsx";
import { Button, NumberInput } from "./index.ts";
import styles from "./ZoomControl.scss";
import i18n from "../i18n.ts";

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
				title={i18n("ZoomScale")}
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
					title={i18n("ResetPinchZoom")}
					type="text"
					className={styles.button}
					onClick={() => onChange(initValue)}
				>
					<BsArrowCounterclockwise/>
				</Button>
			}
		</div>
	);
}

export default React.memo(ZoomControl);
