import { MouseEvent, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import BrightnessIcon from "bootstrap-icons/icons/brightness-high.svg";
import PickColorIcon from "bootstrap-icons/icons/eyedropper.svg";
import { ButtonProps } from "../ui/Button.tsx";
import { PinchZoomState } from "../ui/PinchZoom.tsx";
import { Button, ColorPicker, NumberInput, PinchZoom, SwitchButton, ZoomControl } from "../ui/index.ts";
import { AnalyzeResult, InputImage } from "../features/image-worker.ts";
import { drawImage } from "../utils.ts";
import theme from "../theme.module.scss";
import styles from "./ImageView.scss";

export enum ViewType {
	Original,
	Output,
	Difference,
	HeatMap,
}

const viewTypeNames = [
	"Original",
	"Output",
	"Difference",
	"HeatMap",
];

interface ImageViewTabProps extends ButtonProps {
	target: string;
}

const pinchZoomInit: PinchZoomState = {
	x: 0,
	y: 0,
	scale: 1,
};

export interface ImageViewProps {
	className?: string;
	original: InputImage;
	output: AnalyzeResult;
}

export default function ImageView(props: ImageViewProps) {
	const { original, output, className } = props;
	const { width, height } = original.raw;
	const { heatMap } = output;

	const [pinchZoom, setPinchZoom] = useState(pinchZoomInit);
	const [type, setType] = useState(ViewType.Output);
	const [brightness, setBrightness] = useState(1);
	const [picking, setPicking] = useState(false);
	const [inRegion, setInRegion] = useState(false);
	const [mousePos, setMousePos] = useState({ clientX: 0, clientY: 0 });

	const backCanvas = useRef<HTMLCanvasElement>(null);
	const topCanvas = useRef<HTMLCanvasElement>(null);

	const topImage = (type === ViewType.HeatMap) ? heatMap! : output.data;

	function refreshBottomCanvas() {
		setPinchZoom(pinchZoomInit);
		drawImage(original.raw, backCanvas.current);
	}

	function refreshTopCanvas() {
		drawImage(topImage, topCanvas.current);
	}

	useEffect(refreshBottomCanvas, [original]);
	useEffect(refreshTopCanvas, [topImage]);

	function handleMouseMove(event: MouseEvent) {
		const { clientX, clientY } = event;
		setMousePos({ clientX, clientY });
	}

	const tabData = viewTypeNames.map<ImageViewTabProps>(target => ({ target }));

	if (!heatMap) {
		tabData[3].disabled = true;
		tabData[3].title = "Require enable butteraugli";
	}

	const imageViewTabs = tabData.map(data => {
		const { target, disabled, title } = data;
		const value = ViewType[target as keyof typeof ViewType];
		return (
			<Button
				key={value}
				className="dark"
				type="text"
				active={type === value}
				disabled={disabled}
				title={title}
				onClick={() => setType(value)}
			>
				{target}
			</Button>
		);
	});

	let mixBlendMode = undefined;
	let brightnessVal = 1;
	if (type === ViewType.Difference) {
		mixBlendMode = "difference" as const;
		brightnessVal = brightness;
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

	const pickerCSS = {
		top: clientY,
		left: clientX,
	};

	return (
		<div className={clsx(styles.container, className)}>
			<PinchZoom
				className={styles.main}
				state={pinchZoom}
				// Can't zoom by mouse wheel if scale = 0
				onChange={v => v.scale > 0.01 && setPinchZoom(v)}
			>
				<div
					className={styles.wrapper}
					style={wrapperCSS}
					onMouseOver={() => setInRegion(true)}
					onMouseMove={handleMouseMove}
					onMouseOut={() => setInRegion(false)}
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
			</PinchZoom>

			<div className={styles.tabPanel}>
				<div>{imageViewTabs}</div>

				<div
					className={styles.option}
					title="Pick color"
				>
					<PickColorIcon className={styles.icon}/>
					<SwitchButton
						checked={picking}
						onCheckedChange={setPicking}
					/>
				</div>

				{
					type === ViewType.Difference &&
					<label
						className={styles.option}
						title="Brightness"
					>
						<BrightnessIcon className={styles.icon}/>
						<NumberInput
							value={brightness}
							min={1}
							max={255}
							step={1}
							minMaxButton={true}
							className={theme.darkNumberInput}
							onValueChange={setBrightness}
						/>
					</label>
				}
			</div>

			<ZoomControl
				className={styles.controls}
				initValue={pinchZoomInit}
				value={pinchZoom}
				onChange={setPinchZoom}
			/>

			{
				picking && inRegion &&
				<ColorPicker
					style={pickerCSS}
					x={px}
					y={py}
					imageA={original.raw}
					imageB={output.data}
				/>
			}
		</div>
	);
}
