import { CSSProperties, Dispatch, RefObject, useEffect, useRef, useState } from "react";
import { Button, NumberInput, PinchZoom } from "../ui";
import { PinchZoomState } from "../ui/PinchZoom";
import { ConvertOutput } from "../encode";
import { InputImage } from "./index";
import styles from "./ImageView.scss";
import { ButtonProps } from "../ui/Button";

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

function useResettable<T>(initialState: T): [T, Dispatch<T>, () => void] {
	const [value, setValue] = useState(initialState);
	return [value, setValue, () => setValue(initialState)];
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

interface ImageViewProps {
	original: InputImage;
	output: ConvertOutput;
}

export default function ImageView(props: ImageViewProps) {
	const { original, output } = props;
	const { width = 0, height = 0 } = original.data || {};

	const [type, setType] = useState(ViewType.Compressed);
	const [brightness, setBrightness] = useState(100);

	const [pinchZoom, setPinchZoom, resetPinchZoom] = useResettable<PinchZoomState>({
		x: 0,
		y: 0,
		scale: 1,
	});

	const backCanvas = useRef<HTMLCanvasElement>(null);
	const topCanvas = useRef<HTMLCanvasElement>(null);

	function refreshBottomCanvas() {
		resetPinchZoom();
		drawDataToCanvas(original.data, backCanvas);
	}

	function refreshTopCanvas() {
		const { metrics, data } = output;

		const image = type === ViewType.HeatMap ? metrics.butteraugli!.heatMap : data;
		drawDataToCanvas(image, topCanvas);
	}

	useEffect(refreshBottomCanvas, [original]);
	useEffect(refreshTopCanvas, [type, output]);

	interface ImageViewTabProps extends ButtonProps {
		target: ViewType;
	}

	function ImageViewTab(props: ImageViewTabProps) {
		const { children, target, disabled, title } = props;
		return (
			<Button
				type="text"
				active={type === target}
				disabled={disabled}
				title={title}
				onClick={() => setType(target)}
			>
				{children}
			</Button>
		);
	}

	let brightnessInput = null;
	let brightnessVal = 100;

	if (type === ViewType.AbsDiff) {
		brightnessVal = brightness;
		brightnessInput = (
			<label className={styles.option}>
				Brightness %:
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

	const mixBlendMode = type === ViewType.AbsDiff ? "difference" : undefined;

	const noHeatMap = !output.metrics.butteraugli;
	const heatMapTitle = noHeatMap ? "Require enable butteraugli" : undefined;

	return (
		<div className={styles.container}>
			<div className={styles.inputs}>
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
			<div className={styles.controls}>

			</div>
			<PinchZoom
				className={styles.imageView}
				state={pinchZoom}
				onChange={setPinchZoom}
			>
				<div className={styles.wrapper} style={wrapperCss}>
					<canvas
						className={styles.canvas}
						ref={backCanvas}
						width={width}
						height={height}
					/>
					<canvas
						className={styles.canvas}
						ref={topCanvas}
						width={width}
						height={height}
						style={{ mixBlendMode }}
						hidden={type === ViewType.Original}
					/>
				</div>
			</PinchZoom>
		</div>
	);
}
