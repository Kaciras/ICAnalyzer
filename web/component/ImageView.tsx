import React, { CSSProperties, ReactNode, useEffect, useRef, useState, WheelEvent } from "react";
import Styles from "./ImageView.scss";

interface Props {
	original: string;
	width: number;
	height: number;

	heatMap?: ImageBitmap;
	optimized?: ImageBitmap;
}

export enum ViewType {
	Original,
	Compressed,
	AbsDiff,
	HeatMap,
}

interface ImageViewCSS extends CSSProperties {
	"--original": string;
	"--x": string;
	"--y": string;
	"--scale": number;
	"--brightness": string;
}

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

export default function ImageView(props: Props) {
	const { original, width, height, optimized, heatMap } = props;

	const [type, setType] = useState<ViewType>();
	const [brightness, setBrightness] = useState(100);

	const [zoom, setZoom] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });

	const canvasRef = useRef<HTMLCanvasElement>(null);

	function refreshCanvas() {
		if (!optimized) {
			return; // TODO
		}
		const ctx = canvasRef.current!.getContext("2d");
		if (!ctx) {
			throw new Error("Could not create canvas context");
		}
		if (type === ViewType.HeatMap) {
			ctx.drawImage(heatMap!, 0, 0);
		} else {
			ctx.drawImage(optimized!, 0, 0);
		}
	}

	useEffect(refreshCanvas, [type, original, optimized, heatMap]);

	interface ImageViewTabProps {
		target: ViewType;
		children: ReactNode;
	}

	function ImageViewTab(props: ImageViewTabProps) {
		const { children, target } = props;
		return <button data-actived={type === target} onClick={() => setType(target)}>{children}</button>;
	}

	function handleWheel(event: WheelEvent) {
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
		setZoom(zoom * scaleDiff);
	}

	function offsetUpdater() {
		const baseX = offset.x;
		const baseY = offset.y;

		return (dx: number, dy: number) => {
			const x = baseX + dx;
			const y = baseY + dy;
			setOffset({ x, y });
		};
	}

	const wrapperCss: ImageViewCSS = {
		width, height,
		"--original": `url("${original}")`,
		"--scale": zoom,
		"--x": offset.x + "px",
		"--y": offset.y + "px",
		"--brightness": `${brightness}%`,
	};

	const blend = type === ViewType.AbsDiff ? "difference" : undefined;

	return (
		<section
			className={Styles.container}
			onWheel={handleWheel}
			onMouseDown={e => watchMouseMove(e.nativeEvent, offsetUpdater())}
			onTouchStart={e => watchTouchMove(e.nativeEvent, offsetUpdater())}
		>
			<aside className={Styles.inputs}>
				<ImageViewTab target={ViewType.Original}>Original</ImageViewTab>
				<ImageViewTab target={ViewType.Compressed}>Compressed</ImageViewTab>
				<ImageViewTab target={ViewType.AbsDiff}>AbsDiff</ImageViewTab>
				<ImageViewTab target={ViewType.HeatMap}>HeatMap</ImageViewTab>
			</aside>
			<div
				className={Styles.wrapper}
				style={wrapperCss}
			>
				<canvas
					className={Styles.canvas}
					style={{ mixBlendMode: blend }}
					ref={canvasRef}
					width={width}
					height={height}
					hidden={type === ViewType.Original}
				/>
			</div>
		</section>
	);
}
