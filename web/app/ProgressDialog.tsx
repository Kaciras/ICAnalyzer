import { useEffect, useRef, useState } from "react";
import { Button, Dialog } from "../ui";
import styles from "./ProgressDialog.scss";

interface ProgressPanelProps {
	error?: string;
	max: number;
	value: number;
	onCancel: () => void;
}

export default function ProgressDialog(props: ProgressPanelProps) {
	const { error, value, max, onCancel } = props;

	const startTime = useRef(performance.now());
	const [timeUsage, setTimeUsage] = useState("--:--:--");

	function scheduleRefreshTask() {
		function refreshTime() {
			const ms = performance.now() - startTime.current;
			const date = new Date(ms);
			setTimeUsage(date.toISOString().substr(11, 8));
		}

		const timer = setInterval(refreshTime, 1000);
		return () => clearInterval(timer);
	}

	useEffect(scheduleRefreshTask, []);

	return (
		<Dialog onClose={onCancel}>
			<div className={styles.content}>
				<h1>Encoding...</h1>

				{error && <p className={styles.error}>Error: {error}</p>}

				<div className={styles.text}>
					<span>{value} / {max}</span>
					<span>Elapsed time: {timeUsage}</span>
				</div>

				<progress
					value={value}
					max={max}
					className={styles.progress}
				/>
			</div>
			<div className={styles.buttons}>
				<Button className="second" onClick={onCancel}>Cancel</Button>
			</div>
		</Dialog>
	);
}
