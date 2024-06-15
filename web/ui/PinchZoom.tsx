import React, { Dispatch, ReactNode } from "react";

type MoveHandler = (dx: number, dy: number) => void;

function watchMove(baseEvent: PointerEvent, onMove: MoveHandler) {
	const basePageX = baseEvent.pageX;
	const basePageY = baseEvent.pageY;

	function handleMove(event: PointerEvent) {
		onMove(event.pageX - basePageX, event.pageY - basePageY);
	}

	function handleEnd(event: Event) {
		event.preventDefault();
		document.removeEventListener("pointerup", handleEnd);
		document.removeEventListener("pointermove", handleMove);
	}

	document.addEventListener("pointerup", handleEnd);
	document.addEventListener("pointermove", handleMove);
}

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

	function updateOffset(dx: number, dy: number) {
		const x = state.x + dx;
		const y = state.y + dy;
		onChange({ scale: state.scale, x, y });
	}

	function handlePointerDown(e: React.PointerEvent) {
		if (e.button !== 0) {
			return;
		}
		watchMove(e.nativeEvent, updateOffset);
	}

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
