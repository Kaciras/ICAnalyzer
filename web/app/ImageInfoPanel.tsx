import { bytes } from "../utils";
import { InputImage } from "./index";
import styles from "./ImageInfoPanel.scss";

interface ImageInfoPanelProps {
	image: InputImage;
}

export default function ImageInfoPanel(props: ImageInfoPanelProps) {
	const { file } = props.image;
	const { width, height, data } = props.image.data;

	const ratio = (file.size / data.byteLength * 100).toFixed(2);

	function draw(el: HTMLCanvasElement | null) {
		if (!el) {
			return;
		}
		const ctx = el.getContext("2d");
		ctx?.putImageData(props.image.data, 0, 0);
	}

	return (
		<div className="dialog-content" role="tabpanel">
			<canvas
				className={styles.canvas}
				aria-label="Preview"
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
