import { Dispatch, MouseEvent, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import ResetIcon from "bootstrap-icons/icons/arrow-counterclockwise.svg";
import BrightnessIcon from "bootstrap-icons/icons/brightness-high.svg";
import PickColorIcon from "bootstrap-icons/icons/eyedropper.svg";
import { PinchZoomState } from "../ui/PinchZoom";
import { Button, NumberInput, PinchZoom, SwitchButton } from "../ui";
import { ConvertOutput } from "../encode";
import { InputImage } from "./index";
import { ButtonProps } from "../ui/Button";
import styles from "./ImageView.scss";

export enum ViewType {
	Original,
	Compressed,
	AbsDiff,
	HeatMap,
}

function useResettable<T>(initialState: T): [T, Dispatch<SetStateAction<T>>, () => void] {
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
	const { width, height } = original.data;

	const [type, setType] = useState(ViewType.Compressed);
	const [picking, setPicking] = useState(false);
	const [brightness, setBrightness] = useState(1);

	const [mousePos, setMousePos] = useState({ clientX: 0, clientY: 0 });

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

	function handlePinchZoomChange(newValue: PinchZoomState) {
		if (newValue.scale > 0.01) {
			setPinchZoom(newValue);
		}
	}

	function handleMouseOver(event: MouseEvent) {
		const { clientX, clientY } = event;
		setMousePos({ clientX, clientY });
	}

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
	let brightnessVal = 1;

	if (type === ViewType.AbsDiff) {
		brightnessVal = brightness;
		brightnessInput = (
			<label
				title="Brightness"
				className={styles.option}
			>
				<BrightnessIcon className={styles.icon}/>
				<NumberInput
					className={styles.darkNumberInput}
					value={brightness}
					min={1}
					max={255}
					step={1}
					minMaxButton={true}
					onValueChange={setBrightness}
				/>
			</label>
		);
	}

	const wrapperCSS = {
		width, height,
		"--scale": pinchZoom.scale,
		"--x": pinchZoom.x + "px",
		"--y": pinchZoom.y + "px",
		"--brightness": `${brightnessVal}`,
	};

	const { clientX, clientY } = mousePos;
	const px = Math.floor((clientX - pinchZoom.x - (window.innerWidth - width * pinchZoom.scale) / 2) / pinchZoom.scale);
	const py = Math.floor((clientY - pinchZoom.y - (window.innerHeight - height * pinchZoom.scale) / 2) / pinchZoom.scale);

	function getPixel(image: ImageData, x: number, y: number) {
		const { width, data } = image;
		const i = (x + y * width) * 4;
		return Array.from(data.slice(i, i + 4));
	}

	function pixelToString(pixel: number[]) {
		return pixel.map(n => n.toString(16)).join("");
	}

	const originPixel = getPixel(original.data, px, py);
	const outputPixel = getPixel(output.data, px, py);

	const ips = pixelToString(originPixel);
	const ops = pixelToString(originPixel);
	const dps = pixelToString(originPixel.map((n, i) => Math.abs(n - outputPixel[i])));

	const pickerCSS = {
		left: mousePos.clientX,
		top: mousePos.clientY,
	};

	const mixBlendMode = type === ViewType.AbsDiff ? "difference" : undefined;

	const noHeatMap = !output.metrics.butteraugli;
	const heatMapTitle = noHeatMap ? "Require enable butteraugli" : undefined;

	function setZoom(value: number) {
		setPinchZoom(prev => ({ ...prev, scale: value / 100 }));
	}

	return (
		<div className={styles.container}>
			<PinchZoom
				className={styles.imageView}
				state={pinchZoom}
				onChange={handlePinchZoomChange}
			>
				<div
					className={styles.wrapper}
					style={wrapperCSS}
					onMouseOver={handleMouseOver}
				>
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

				{
					picking &&
					<div className={styles.popup} style={pickerCSS}>
						<div>x: {px}, y: {py}</div>
						<div className={styles.color}>Orig: #{ips}</div>
						<div className={styles.color}>Output: #{ops}</div>
						<div className={styles.color}>Diff: #{dps}</div>
					</div>
				}
			</PinchZoom>

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

				<div
					className={styles.option}
					title="Pick color"
				>
					<PickColorIcon className={styles.icon}/>
					<SwitchButton
						checked={picking}
						onValueChange={setPicking}
					/>
				</div>

				{brightnessInput}
			</div>

			<div className={styles.controls}>
				<NumberInput
					title="Zoom scale"
					min={1}
					step={1}
					increment={50}
					className={styles.zoomInput}
					value={Math.round(pinchZoom.scale * 100)}
					onValueChange={setZoom}
				/>
				<Button
					title="Reset view"
					type="text"
					className={styles.button}
					onClick={resetPinchZoom}
				>
					<ResetIcon/>
				</Button>
			</div>
		</div>
	);
}
