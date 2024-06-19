import React, { ComponentType, SVGProps } from "react";

export type SVGComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const stopPropagation = (e: MouseEvent | React.MouseEvent) => e.stopPropagation();

export function drawImage(data: ImageData, el: HTMLCanvasElement | null) {
	if (el === null) {
		return;
	}
	const ctx = el.getContext("2d");
	if (ctx) {
		ctx.putImageData(data, 0, 0);
	} else {
		throw new Error("Canvas not initialized");
	}
}

type PointerMoveHandler = (e: PointerEvent, init: PointerEvent) => void;

export function dragHandler(listener: PointerMoveHandler) {
	return function (initEvent: React.PointerEvent) {
		if (initEvent.button !== 0) {
			return;
		}
		const { nativeEvent } = initEvent;

		// Avoid dragging underlying elements.
		initEvent.preventDefault();

		function handleMove(event: PointerEvent) {
			listener(event, nativeEvent);
		}

		function handleEnd(event: Event) {
			event.preventDefault();
			document.removeEventListener("pointerup", handleEnd);
			document.removeEventListener("pointermove", handleMove);
		}

		document.addEventListener("pointerup", handleEnd);
		document.addEventListener("pointermove", handleMove);
	};
}
