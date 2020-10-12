import React, { ReactNode, useState } from "react";
import Styles from "./ImageView.scss";
import ImageDiff from "./ImageDiff";

interface Props {
	original?: string;
	width: number;
	height: number;

	optimized?: ImageBitmap;
	heatMap?: ImageBitmap;
}

export enum ViewType {
	Original,
	Compressed,
	AbsDiff,
	HeatMap,
}

export default function ImageView(props: Props) {
	const [type, setType] = useState<ViewType>();

	interface ImageViewTabProps {
		target: ViewType;
		children: ReactNode;
	}

	function ImageViewTab(props: ImageViewTabProps) {
		const { children, target } = props;
		return <button data-actived={type === target} onClick={() => setType(target)}>{children}</button>;
	}

	let view;
	if (type === ViewType.Original) {
		view = <img alt="Original Image" src={props.original}/>;
	} else if (type === ViewType.Compressed) {

	} else if (type === ViewType.AbsDiff) {
		view = <ImageDiff
			original={props.original}
			optimized={props.optimized}
			width={props.width}
			height={props.height}
		/>;
	} else if (type === ViewType.HeatMap) {

	}

	return (
		<section className={Styles.container}>
			<aside>
				<ImageViewTab target={ViewType.Original}>Original</ImageViewTab>
				<ImageViewTab target={ViewType.Compressed}>Compressed</ImageViewTab>
				<ImageViewTab target={ViewType.AbsDiff}>AbsDiff</ImageViewTab>
				<ImageViewTab target={ViewType.HeatMap}>HeatMap</ImageViewTab>
			</aside>
			{view}
		</section>
	);
}
