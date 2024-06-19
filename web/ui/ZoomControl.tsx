import React from "react";
import { BsArrowCounterclockwise } from "react-icons/bs";
import i18n from "../i18n.ts";
import { PinchZoomState } from "./PinchZoom.tsx";
import { Button, NumberInput } from "./index.ts";
import styles from "./ZoomControl.scss";
import { Mutator } from "../hooks.ts";

export interface ZoomControlProps extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> {
	defaultValue?: PinchZoomState;
	value: PinchZoomState;
	onChange: Mutator<PinchZoomState>;
}

function ZoomControl(props: ZoomControlProps) {
	const { defaultValue, value, onChange, ...otherProps } = props;

	function setZoom(value: number) {
		onChange(prev => ({ ...prev, scale: value / 100 }));
	}

	return (
		<div {...otherProps}>
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
				defaultValue &&
				<Button
					title={i18n("ResetPinchZoom")}
					type="text"
					className={styles.button}
					onClick={() => onChange(defaultValue)}
				>
					<BsArrowCounterclockwise/>
				</Button>
			}
		</div>
	);
}

export default React.memo(ZoomControl);
