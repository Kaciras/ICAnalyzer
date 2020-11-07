import React, { Dispatch, ReactNode } from "react";

type PointerMoveHandler = (dx: number, dy: number) => void;

function watchMouseMove(baseEvent: MouseEvent, handler: PointerMoveHandler) {
	const basePageX = baseEvent.pageX;
	const basePageY = baseEvent.pageY;

	function handleMove(event: MouseEvent) {
		handler(event.pageX - basePageX, event.pageY - basePageY);
	}

	function handleEnd(event: Event) {
		event.preventDefault();
		document.removeEventListener("mousemove", handleMove);
		document.removeEventListener("mouseup", handleEnd);
	}

	document.addEventListener("mousemove", handleMove);
	document.addEventListener("mouseup", handleEnd);
}

function watchTouchMove(baseEvent: TouchEvent, handler: PointerMoveHandler) {
	const basePointer = baseEvent.touches[0];

	function handleMove(event: TouchEvent) {
		const touch = event.touches[0];
		handler(touch.pageX - basePointer.pageX, touch.pageY - basePointer.pageY);
	}

	function handleEnd(event: Event) {
		event.preventDefault();
		document.removeEventListener("touchmove", handleMove);
		document.removeEventListener("touchend", handleEnd);
	}

	document.addEventListener("touchmove", handleMove);
	document.addEventListener("touchend", handleEnd);
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
		const { ctrlKey, deltaMode } = event;
		let { deltaY } = event;

		event.preventDefault();

		// 1 is "lines", 0 is "pixels"
		if (deltaMode === 1) {
			deltaY *= 15; // Firefox uses "lines" for some types of mouse
		}

		// ctrlKey is true when pinch-zooming on a trackpad.
		const divisor = ctrlKey ? 100 : 300;
		const scaleDiff = 1 - deltaY / divisor;
		onChange({ ...state, scale: state.scale * scaleDiff });
	}

	function offsetUpdater() {
		const baseX = state.x;
		const baseY = state.y;

		return (dx: number, dy: number) => {
			const x = baseX + dx;
			const y = baseY + dy;
			onChange({ ...state, x, y });
		};
	}

	return (
		<div
			className={className}
			onWheel={handleWheel}
			onMouseDown={e => e.button === 0 && watchMouseMove(e.nativeEvent, offsetUpdater())}
			onTouchStart={e => watchTouchMove(e.nativeEvent, offsetUpdater())}
		>
			{children}
		</div>
	);
}
