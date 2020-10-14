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
}

export default function ImageView(props: Props) {
	const { original, width, height, optimized, heatMap } = props;

	const [type, setType] = useState<ViewType>();
	const [zoom, setZoom] = useState(1);
	const [move, setMove] = useState({ x: 0, y: 0 });

	const canvasRef = useRef<HTMLCanvasElement>(null);

	function refreshCanvas() {
		let canvasImage = optimized;

		if (type === ViewType.HeatMap) {
			canvasImage = heatMap;
		}

		if (canvasImage) {
			const ctx = canvasRef.current!.getContext("2d");
			if (!ctx) {
				throw new Error("Could not create canvas context");
			}
			ctx.drawImage(canvasImage, 0, 0);
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
		setZoom(zoom + scaleDiff);
	}

	const wrapperCss: ImageViewCSS = {
		width, height,
		"--original": `url("${original}")`,
		"--scale": zoom,
		"--x": move.x + "px",
		"--y": move.y + "px",
	};

	const blend = type === ViewType.AbsDiff ? "difference" : undefined;

	return (
		<section
			className={Styles.container}
			onWheel={handleWheel}
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
