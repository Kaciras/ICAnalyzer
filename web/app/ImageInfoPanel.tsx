import { dataSizeIEC } from "@kaciras/utilities/browser";
import i18n from "../i18n.ts";
import { TabPanelBase } from "../ui/TabSwitch.tsx";
import { drawImage } from "../utils.ts";
import { InputImage } from "../features/image-worker.ts";
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
				aria-label={i18n("Preview")}
				ref={el => drawImage(raw, el)}
				width={width}
				height={height}
			/>
			<dl className={styles.attributes}>
				<dt>{i18n("FileName")}:</dt>
				<dd>{file.name}</dd>

				<dt>{i18n("FileType")}:</dt>
				<dd>{file.type}</dd>

				<dt>{i18n("Resolution")}:</dt>
				<dd>{width} x {height}</dd>

				<dt>{i18n("RawSize")}:</dt>
				<dd>{dataSizeIEC.formatDiv(data.byteLength)}</dd>

				<dt>{i18n("FileSizeAndRatio")}:</dt>
				<dd>{dataSizeIEC.formatDiv(file.size)} ({ratio}%)</dd>
			</dl>
		</div>
	);
}
