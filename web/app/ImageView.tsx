import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { IconButton, NumberInput } from "../ui";
import { InputImage } from "./App";
import Styles from "./ImageView.scss";
import { ConvertOutput } from "../encoding";

interface Props {
	original?: InputImage;
	optimized?: ConvertOutput;
}

export enum ViewType {
	Original,
	Compressed,
	AbsDiff,
	HeatMap,
}

interface ImageViewCSS extends CSSProperties {
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
	const { original, optimized } = props;
	const { width = 0, height = 0 } = original?.data || {};

	const [type, setType] = useState(ViewType.Compressed);
	const [brightness, setBrightness] = useState(100);

	const [zoom, setZoom] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });

	const backCanvas = useRef<HTMLCanvasElement>(null);
	const topCanvas = useRef<HTMLCanvasElement>(null);

	function refreshCanvas() {
		if (!optimized) {
			return;
		}
		const { metrics, data } = optimized;
		const ctx = topCanvas.current!.getContext("2d");
		if (!ctx) {
			throw new Error("Could not create canvas context");
		}
		if (type === ViewType.HeatMap) {
			ctx.putImageData(metrics.butteraugli!.heatMap, 0, 0);
		} else {
			ctx.putImageData(data!, 0, 0);
		}
	}

	function refreshBackground() {
		if (!original) {
			return;
		}
		setZoom(1);
		setOffset({ x: 0, y: 0 });

		const ctx = backCanvas.current!.getContext("2d")!;
		ctx.putImageData(original.data!, 0, 0);
	}

	useEffect(refreshBackground, [original]);
	useEffect(refreshCanvas, [type, optimized]);

	interface ImageViewTabProps {
		target: ViewType;
		disabled?: boolean;
		children: ReactNode;
	}

	function ImageViewTab(props: ImageViewTabProps) {
		const { children, target, disabled } = props;
		return (
			<IconButton
				active={type === target}
				disabled={disabled}
				onClick={() => setType(target)}
			>
				{children}
			</IconButton>
		);
	}

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
		setZoom(zoom * (1 - deltaY / divisor));
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

	let brightnessInput = null;
	let brightnessVal = 100;

	if (type === ViewType.AbsDiff) {
		brightnessVal = brightness;
		brightnessInput = (
			<label>
				Brightness:
				<NumberInput
					value={brightness}
					min={100}
					step={50}
					onChange={setBrightness}
				/>
			</label>
		);
	}

	const wrapperCss: ImageViewCSS = {
		width, height,
		"--scale": zoom,
		"--x": offset.x + "px",
		"--y": offset.y + "px",
		"--brightness": `${brightnessVal}%`,
	};

	const blend = type === ViewType.AbsDiff ? "difference" : undefined;
	const butteraugliAvailable = !optimized?.metrics.butteraugli;

	return (
		<div className={Styles.container}>
			<div className={Styles.inputs}>
				<div>
					<ImageViewTab target={ViewType.Original}>Original</ImageViewTab>
					<ImageViewTab target={ViewType.Compressed}>Compressed</ImageViewTab>
					<ImageViewTab target={ViewType.AbsDiff}>Difference</ImageViewTab>
					<ImageViewTab disabled={butteraugliAvailable} target={ViewType.HeatMap}>HeatMap</ImageViewTab>
				</div>
				{brightnessInput}
			</div>
			<div className={Styles.controls}>

			</div>
			<div
				className={Styles.imageView}
				onWheel={handleWheel}
				onMouseDown={e => e.button === 0 && watchMouseMove(e.nativeEvent, offsetUpdater())}
				onTouchStart={e => watchTouchMove(e.nativeEvent, offsetUpdater())}
			>
				<div className={Styles.wrapper} style={wrapperCss}>
					<canvas
						className={Styles.canvas}
						ref={backCanvas}
						width={width}
						height={height}
					/>
					<canvas
						className={Styles.canvas}
						style={{ mixBlendMode: blend }}
						ref={topCanvas}
						width={width}
						height={height}
						hidden={type === ViewType.Original}
					/>
				</div>
			</div>
		</div>
	);
}
