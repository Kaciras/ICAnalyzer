import { MouseEvent, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { BsBrightnessHigh, BsEyedropper } from "react-icons/bs";
import { ButtonProps } from "../ui/Button.tsx";
import { PinchZoomState } from "../ui/PinchZoom.tsx";
import { Button, ColorPicker, NumberInput, PinchZoom, SwitchButton, ZoomControl } from "../ui/index.ts";
import { AnalyzeResult, InputImage } from "../features/image-worker.ts";
import theme from "../theme.module.scss";
import styles from "./ImageView.scss";
import { drawImage, usePointerMove } from "../utils.ts";
import i18n from "../i18n.ts";

export enum ViewType {
	Split,
	Input,
	Output,
	Diff,
	HeatMap,
}

const viewTypeNames = [
	i18n("SplitView"),
	i18n("InputView"),
	i18n("OutputView"),
	i18n("DiffView"),
	i18n("HeatMapView"),
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
	const [splitPoint, setSplitPoint] = useState(window.innerWidth / 2);

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

	function handlePointerMove(event: MouseEvent) {
		const { clientX, clientY } = event;
		setMousePos({ clientX, clientY });
	}

	const tabData = viewTypeNames.map<ImageViewTabProps>(target => ({ target }));

	if (!heatMap) {
		tabData[4].disabled = true;
		tabData[4].title = i18n("RequireButteraugli");
	}

	const imageViewTabs = tabData.map((data, index) => {
		const { target, disabled, title } = data;
		return (
			<Button
				key={index}
				className="dark"
				type="text"
				active={type === index}
				disabled={disabled}
				title={title}
				onClick={() => setType(index)}
			>
				{target}
			</Button>
		);
	});

	let mixBlendMode = undefined;
	let brightnessVal = 1;
	if (type === ViewType.Diff) {
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

	const splitCSS = type === ViewType.Split
		? { "--split": `${splitPoint}px` }
		: undefined;

	const { clientX, clientY } = mousePos;
	const px = Math.floor((clientX - pinchZoom.x - (window.innerWidth - width * pinchZoom.scale) / 2) / pinchZoom.scale);
	const py = Math.floor((clientY - pinchZoom.y - (window.innerHeight - height * pinchZoom.scale) / 2) / pinchZoom.scale);

	const pickerCSS = {
		top: clientY,
		left: clientX,
	};

	const onPointerDown = usePointerMove(e => {
		const p = e.pageX;
		if (p > 0 && p < window.innerWidth) {
			setSplitPoint(p); // Prevent move to out of window.
		}
	});

	return (
		<div className={clsx(styles.container, className)} style={splitCSS}>
			<PinchZoom
				className={styles.main}
				state={pinchZoom}
				// Can't zoom by mouse wheel if scale = 0
				onChange={v => v.scale > 0.01 && setPinchZoom(v)}
			>
				<div
					className={styles.wrapper}
					style={wrapperCSS}
					onPointerOver={() => setInRegion(true)}
					onPointerMove={handlePointerMove}
					onPointerOut={() => setInRegion(false)}
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
						hidden={type === ViewType.Input}
					/>
				</div>
			</PinchZoom>

			<div
				hidden={type !== ViewType.Split}
				className={styles.separator}
				onPointerDown={onPointerDown}
			/>

			<div className={styles.tabPanel}>
				<div>{imageViewTabs}</div>

				<div
					className={styles.option}
					title={i18n("PickColor")}
				>
					<BsEyedropper className={styles.icon}/>
					<SwitchButton
						checked={picking}
						onCheckedChange={setPicking}
					/>
				</div>

				{
					type === ViewType.Diff &&
					<label
						className={styles.option}
						title={i18n("Brightness")}
					>
						<BsBrightnessHigh className={styles.icon}/>
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
