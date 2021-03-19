import { bytes } from "../utils";
import styles from "./ImageInfoPanel.scss";

interface Props {
	file: File;
	image: ImageData;
}

export default function ImageInfoPanel(props: Props) {
	const { file } = props;
	const { width, height, data } = props.image;

	const ratio = (file.size / data.byteLength * 100).toFixed(2);

	function draw(el: HTMLCanvasElement | null) {
		if (!el) {
			return;
		}
		const ctx = el.getContext("2d");
		ctx?.putImageData(props.image, 0, 0);
	}

	return (
		<div className="dialog-content">
			<canvas
				className={styles.canvas}
				ref={draw}
				width={width}
				height={height}
			/>
			<dl className={styles.attributes}>
				<dt>File name:</dt>
				<dd>{file.name}</dd>

				<dt>Type:</dt>
				<dd>{file.type}</dd>

				<dt>Resolution:</dt>
				<dd>{width} x {height}</dd>

				<dt>Raw size:</dt>
				<dd>{bytes(data.byteLength)}</dd>

				<dt>File size (Ratio %):</dt>
				<dd>{bytes(file.size)} ({ratio}%)</dd>
			</dl>
		</div>
	);
}
