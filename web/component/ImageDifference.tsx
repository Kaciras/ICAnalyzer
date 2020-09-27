import React from "react";
import style from "./imageDifference.scss";

export interface ImageDiffProps {
	original?: Blob;
	optimized?: ImageData;
}

export default function ImageDifference(props: ImageDiffProps) {
	return (
		<div className={style.container}>
			<canvas className={style.canvas}/>
		</div>
	);
}
