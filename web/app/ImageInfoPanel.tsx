import { bytes } from "../utils";
import { InputImage } from "./index";
import styles from "./ImageInfoPanel.scss";

interface ImageInfoPanelProps {
	value: InputImage;
}

export default function ImageInfoPanel(props: ImageInfoPanelProps) {
	const { file, raw } = props.value;
	const { width, height, data } = raw;

	const ratio = (file.size / data.byteLength * 100).toFixed(2);

	function drawImage(el: HTMLCanvasElement | null) {
		el?.getContext("2d")!.putImageData(raw, 0, 0);
	}

	return (
		<div className="dialog-content" role="tabpanel">
			<canvas
				className={styles.canvas}
				aria-label="Preview"
				ref={drawImage}
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
