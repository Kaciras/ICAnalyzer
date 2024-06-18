import React, { Dispatch, ReactNode } from "react";
import { usePointerMove } from "../utils.ts";

export interface PinchZoomState {
	x: number;
	y: number;
	scale: number;
}

export interface PinchZoomProps {
	state: PinchZoomState;
	className?: string;
	children: ReactNode;
	onChange: Dispatch<PinchZoomState>;
}

export default function PinchZoom(props: PinchZoomProps) {
	const { state, className, children, onChange } = props;

	function handleWheel(event: React.WheelEvent) {
		const { ctrlKey, deltaMode, clientX, clientY } = event;
		let { deltaY } = event;

		event.preventDefault();

		// 1 is "lines", 0 is "pixels"
		if (deltaMode === 1) {
			deltaY *= 15;
		}

		// ctrlKey is true when pinch-zooming on a trackpad.
		const divisor = ctrlKey ? 100 : 300;
		const scaleDiff = 1 - deltaY / divisor;

		const rect = event.currentTarget.firstElementChild!.getBoundingClientRect();
		const dx = ((rect.left + rect.width / 2) - clientX) * (scaleDiff - 1);
		const dy = ((rect.top + rect.height / 2) - clientY) * (scaleDiff - 1);

		onChange({
			x: state.x + dx,
			y: state.y + dy,
			scale: state.scale * scaleDiff,
		});
	}

	const handlePointerDown = usePointerMove((event, init) => {
		const { pageX, pageY } = event;
		const { pageX: initX, pageY: initY } = init;

		const x = state.x + pageX - initX;
		const y = state.y + pageY - initY;
		onChange({ scale: state.scale, x, y });
	});

	return (
		<div
			style={{ touchAction: "none" }}
			className={className}
			onWheel={handleWheel}
			onPointerDown={handlePointerDown}
		>
			{children}
		</div>
	);
}
