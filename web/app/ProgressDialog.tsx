import { useEffect, useRef, useState } from "react";
import { Button, Dialog } from "../ui/index.ts";
import styles from "./ProgressDialog.scss";

interface ProgressDialogProps {
	error?: string;
	max: number;
	value: number;
	onCancel: () => void;
}

export default function ProgressDialog(props: ProgressDialogProps) {
	const { value, max, error, onCancel } = props;

	const startTime = useRef(performance.now());
	const timer = useRef(0);
	const [timeUsage, setTimeUsage] = useState("--:--:--");

	function scheduleTimer() {

		function refresh() {
			const ms = performance.now() - startTime.current;
			const date = new Date(ms);
			setTimeUsage(date.toISOString().substr(11, 8));
		}

		timer.current = window.setInterval(refresh, 1000);
		return () => window.clearInterval(timer.current);
	}

	function interruptOnError() {
		if (error) {
			window.clearInterval(timer.current);
		}
	}

	useEffect(scheduleTimer, []);
	useEffect(interruptOnError, [error]);

	return (
		<Dialog onClose={onCancel}>
			<div className={styles.content}>
				<h1>Analyzing...</h1>

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
