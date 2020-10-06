import React, { CSSProperties, useEffect, useRef, useState } from "react";
import Styles from "./ImageDiff.scss";

export interface ImageDiffProps {
	original?: Blob;
	optimized?: ImageBitmap;
	width: number;
	height: number;
}

export default function ImageDiff(props: ImageDiffProps) {
	const canvasEl = useRef<HTMLCanvasElement>(null);

	const [wrapperStyle, setWrapperStyle] = useState<CSSProperties>({});
	const [brightness, setBrightness] = useState(100);

	const style = Object.assign(
		{ "--brightness": `${props.brightness}%` },
		wrapperStyle
	);

	useEffect(() => {
		if (!props.original) {
			return;
		}
		const rawUrl = URL.createObjectURL(props.original);

		const canvas = canvasEl.current!;
		canvas.width = props.width;
		canvas.height = props.height;

		setWrapperStyle({
			backgroundImage: `url("${rawUrl}")`,
		});
		return () => URL.revokeObjectURL(rawUrl);
	}, [props.original]);

	useEffect(() => {
		if (!props.optimized) {
			return;
		}
		const ctx = canvasEl.current!.getContext("2d");
		ctx!.drawImage(props.optimized!, 0, 0);
	}, [props.optimized]);

	return (
		<div className={Styles.container} style={style}>
			<canvas className={Styles.canvas} ref={canvasEl}/>

			<label className={Styles.range}>
				brightness %
				<input
					type="number"
					min={100}
					step={50}
					value={brightness}
					onChange={e => setBrightness(e.currentTarget.valueAsNumber)}
				/>
			</label>
		</div>
	);
}
