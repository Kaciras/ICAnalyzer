import React, { Dispatch, ReactNode } from "react";

type PointerMoveHandler = (dx: number, dy: number) => void;

function watchMouseMove(baseEvent: MouseEvent, onMove: PointerMoveHandler) {
	const basePageX = baseEvent.pageX;
	const basePageY = baseEvent.pageY;

	function handleMove(event: MouseEvent) {
		onMove(event.pageX - basePageX, event.pageY - basePageY);
	}

	function handleEnd(event: Event) {
		event.preventDefault();
		document.removeEventListener("mousemove", handleMove);
		document.removeEventListener("mouseup", handleEnd);
	}

	document.addEventListener("mousemove", handleMove);
	document.addEventListener("mouseup", handleEnd);
}

function watchTouchMove(baseEvent: TouchEvent, onMove: PointerMoveHandler) {
	const basePointer = baseEvent.touches[0];

	function handleMove(event: TouchEvent) {
		const touch = event.touches[0];
		onMove(
			touch.pageX - basePointer.pageX,
			touch.pageY - basePointer.pageY,
		);
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

	function handleMouseDown(e: React.MouseEvent) {
		if (e.button !== 0) {
			return;
		}
		watchMouseMove(e.nativeEvent, updateOffset);
	}

	function handleTouchStart(e: React.TouchEvent) {
		watchTouchMove(e.nativeEvent, updateOffset);
	}

	return (
		<div
			style={{ touchAction: "none" }}
			className={className}
			onWheel={handleWheel}
			onTouchStart={handleTouchStart}
			onMouseDown={handleMouseDown}
		>
			{children}
		</div>
	);
}
