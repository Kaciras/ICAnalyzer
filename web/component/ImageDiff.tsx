import React, { CSSProperties, useEffect, useRef, useState } from "react";
import style from "./ImageDiff.scss";

export interface ImageDiffProps {
	original?: Blob;
	optimized?: ImageBitmap;
	width: number;
	height: number;
	brightness: number;
}

export default function ImageDiff(props: ImageDiffProps) {
	const canvasEl = useRef<HTMLCanvasElement>(null);
	const [wrapperStyle, setWrapperStyle] = useState<CSSProperties>({});

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
		<div className={style.container} style={wrapperStyle}>
			<canvas className={style.canvas} ref={canvasEl}/>
		</div>
	);
}
