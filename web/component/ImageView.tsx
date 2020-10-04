import React, { useState } from "react";
import Styles from "./ImageView.scss";

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

	if (type === ViewType.Original) {
		return <img alt="Original Image" src={props.original}/>;
	} else if (type === ViewType.Compressed) {

	} else if(type === ViewType.AbsDiff) {

	} else if (type === ViewType.HeatMap) {

	}

	return (
		<section className={Styles.container}>
			<aside>
				<button
					data-actived={type === 0}
					onClick={() => setType(0)}
				>
					Original
				</button>
				<button
					data-actived={type === 1}
					onClick={() => setType(1)}
				>
					Compressed
				</button>
				<button
					data-actived={type === 2}
					onClick={() => setType(2)}
				>
					Abs Diff
				</button>
				<button
					disabled={!!props.heatMap}
					data-actived={type === 3}
					onClick={() => setType(3)}
				>
					Heat Map
				</button>
			</aside>

		</section>
	);
}
