import { CSSProperties, RefObject, useEffect, useRef, useState } from "react";
import { IconButton, NumberInput, PinchZoom } from "../ui";
import { PinchZoomState } from "../ui/PinchZoom";
import { IconButtonProps } from "../ui/IconButton";
import Styles from "./ImageView.scss";
import { ConvertOutput } from "../encode";
import { InputImage } from "./index";

interface ImageViewProps {
	original: InputImage;
	optimized: ConvertOutput;
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

function drawDataToCanvas(data: ImageData, canvas: RefObject<HTMLCanvasElement>) {
	if (canvas.current === null) {
		throw new Error("Canvas is null");
	}
	const ctx = canvas.current.getContext("2d");
	if (!ctx) {
		throw new Error("Canvas not initialized");
	}
	ctx.putImageData(data, 0, 0);
}

export default function ImageView(props: ImageViewProps) {
	const { original, optimized } = props;
	const { width = 0, height = 0 } = original.data || {};

	const [type, setType] = useState(ViewType.Compressed);
	const [brightness, setBrightness] = useState(100);

	const [pinchZoom, setPinchZoom] = useState<PinchZoomState>({ x: 0, y: 0, scale: 1 });

	const backCanvas = useRef<HTMLCanvasElement>(null);
	const topCanvas = useRef<HTMLCanvasElement>(null);

	function refreshBackCanvas() {
		setPinchZoom({ x: 0, y: 0, scale: 1 });
		drawDataToCanvas(original.data, backCanvas);
	}

	function refreshTopCanvas() {
		const { metrics, data } = optimized;

		const image = type === ViewType.HeatMap
			? metrics.butteraugli!.heatMap : data;

		drawDataToCanvas(image, topCanvas);
	}

	useEffect(refreshBackCanvas, [original]);
	useEffect(refreshTopCanvas, [type, optimized]);

	interface ImageViewTabProps extends IconButtonProps {
		target: ViewType;
	}

	function ImageViewTab(props: ImageViewTabProps) {
		const { children, target, disabled, title } = props;
		return (
			<IconButton
				active={type === target}
				disabled={disabled}
				title={title}
				onClick={() => setType(target)}
			>
				{children}
			</IconButton>
		);
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
					onValueChange={setBrightness}
				/>
			</label>
		);
	}

	const wrapperCss: ImageViewCSS = {
		width, height,
		"--scale": pinchZoom.scale,
		"--x": pinchZoom.x + "px",
		"--y": pinchZoom.y + "px",
		"--brightness": `${brightnessVal}%`,
	};

	const blend = type === ViewType.AbsDiff ? "difference" : undefined;

	const noHeatMap = !optimized.metrics.butteraugli;
	const heatMapTitle = noHeatMap ? "You should enable butteraugli to see this" : undefined;

	return (
		<div className={Styles.container}>
			<div className={Styles.inputs}>
				<div>
					<ImageViewTab
						target={ViewType.Original}
					>
						Original
					</ImageViewTab>
					<ImageViewTab
						target={ViewType.Compressed}
					>
						Output
					</ImageViewTab>
					<ImageViewTab
						target={ViewType.AbsDiff}
					>
						Difference
					</ImageViewTab>
					<ImageViewTab
						disabled={noHeatMap}
						title={heatMapTitle}
						target={ViewType.HeatMap}
					>
						HeatMap
					</ImageViewTab>
				</div>
				{brightnessInput}
			</div>
			<div className={Styles.controls}>

			</div>
			<PinchZoom
				className={Styles.imageView}
				state={pinchZoom}
				onChange={setPinchZoom}
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
						ref={topCanvas}
						width={width}
						height={height}
						style={{ mixBlendMode: blend }}
						hidden={type === ViewType.Original}
					/>
				</div>
			</PinchZoom>
		</div>
	);
}
