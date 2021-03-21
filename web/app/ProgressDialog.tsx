import { useMemo, useState } from "react";
import { Button, Dialog } from "../ui";
import { debounce } from "../utils";
import styles from "./ProgressDialog.scss";

const formatter = new Intl.RelativeTimeFormat("en");

interface ProgressPanelProps {
	error?: string;
	max: number;
	value: number;
	onCancel: () => void;
}

function calcTime(start: number, value: number, max: number) {
	const duration = performance.now() - start;
	return (max - value) / value * duration;
}

export default function ProgressDialog(props: ProgressPanelProps) {
	const { error, value, max, onCancel } = props;

	const [start] = useState(() => performance.now());
	const debounced = useMemo(() => debounce(500, calcTime), []);

	const ms = debounced(start, value, max);
	const remaining = Number.isNaN(ms)
		? "----"
		: formatter.format(~~(ms / 1000), "seconds");

	return (
		<Dialog>
			<div className={styles.content}>
				<h1>Encoding...</h1>

				{error && <p className={styles.error}>Error: {error}</p>}

				<div className={styles.text}>
					<span>{value} / {max}</span>
					<span>{remaining}</span>
				</div>

				<progress
					value={value}
					max={max}
					className={styles.progress}
				/>
			</div>
			<div className={styles.buttons}>
				<Button color="second" onClick={onCancel}> Cancel </Button>
			</div>
		</Dialog>
	);
}
