import { dataSizeIEC } from "@kaciras/utilities/browser";
import { TabPanelBase } from "../ui/TabSwitch";
import { drawImage } from "../utils";
import { InputImage } from "../features/image-worker";
import styles from "./ImageInfoPanel.scss";

interface ImageInfoPanelProps extends TabPanelBase {
	value: InputImage;
}

export default function ImageInfoPanel(props: ImageInfoPanelProps) {
	const { isActive, value } = props;
	const { file, raw } = value;
	const { width, height, data } = raw;

	if (isActive === false) {
		return null;
	}

	const ratio = (file.size / data.byteLength * 100).toFixed(2);

	return (
		<div className="dialog-content" role="tabpanel">
			<canvas
				className={styles.canvas}
				aria-label="Preview"
				ref={el => drawImage(raw, el)}
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
				<dd>{dataSizeIEC.formatDiv(data.byteLength)}</dd>

				<dt>File size (Ratio %):</dt>
				<dd>{dataSizeIEC.formatDiv(file.size)} ({ratio}%)</dd>
			</dl>
		</div>
	);
}
