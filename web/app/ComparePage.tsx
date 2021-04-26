import { useState } from "react";
import UploadIcon from "bootstrap-icons/icons/cloud-upload.svg";
import ChartIcon from "bootstrap-icons/icons/bar-chart-line.svg";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { Button } from "../ui";
import ImageView from "./ImageView";
import { MetricMeta } from "./index";
import { AnalyzePageProps } from "./AnalyzePage";
import styles from "./AnalyzePage.scss";

interface MetricsPanelProps {
	visible: boolean;
	metas: MetricMeta[];
	metrics: Record<string, number>;
}

function MetricsPanel(props: MetricsPanelProps) {
	const { visible, metas, metrics } = props;

	if (!visible) {
		return null;
	}

	const items = [];
	for (const { key, name } of metas) {
		items.push(<dt>{name}:</dt>);
		items.push(<dd>{metrics[key].toFixed(3)}</dd>);
	}

	return <dl className={styles.simpleMetrics}>{items}</dl>;
}

export default function ComparePage(props: AnalyzePageProps) {
	const { result, onStart, onClose } = props;
	const { input, outputMap, seriesMeta } = result;

	const [showChart, setShowChart] = useState(true);

	const output = outputMap.get({});

	return (
		<>
			<ImageView
				className={styles.imageView}
				original={input}
				output={output}
			/>

			<MetricsPanel
				visible={showChart}
				metas={seriesMeta}
				metrics={output.metrics}
			/>

			<div className={styles.buttonPanel}>
				<Button
					title="Back"
					type="text"
					className={styles.iconButton}
					onClick={onClose}
				>
					<CloseIcon/>
				</Button>
				<Button
					title="Select an image"
					type="text"
					className={styles.iconButton}
					onClick={onStart}
				>
					<UploadIcon/>
				</Button>
				<Button
					title="Show metrics"
					type="text"
					className={styles.iconButton}
					active={showChart}
					onClick={() => setShowChart(!showChart)}
				>
					<ChartIcon/>
				</Button>
			</div>
		</>
	);
}
