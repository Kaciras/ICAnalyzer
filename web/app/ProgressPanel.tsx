import React, { useMemo, useState } from "react";
import { MyButton } from "../ui";
import Styles from "./ProgressPanel.scss";
import { debounce } from "../utils";

const formatter = new Intl.RelativeTimeFormat("en");

interface ProgressPanelProps {
	max: number;
	value: number;
	onCancel: () => void;
}

function calcTime(start: number, value: number, max: number) {
	const duration = performance.now() - start;
	return (max - value) / value * duration;
}

export default function ProgressPanel(props: ProgressPanelProps) {
	const { value, max, onCancel } = props;

	const [start] = useState(() => performance.now());
	const debounced = useMemo(() => debounce(500, calcTime), []);

	const ms = debounced(start, value, max);
	const remaining = Number.isNaN(ms)
		? "----"
		: formatter.format(~~(ms / 1000), "seconds");

	return (
		<>
			<h1>Encoding...</h1>
			<div className={Styles.content}>
				<div className={Styles.textProgress}>
					<span>{value}/{max}</span>
					<span>Remaining: {remaining}</span>
				</div>
				<progress
					value={value}
					max={max}
					className={Styles.progress}
				/>
				<div className={Styles.buttons}>
					<MyButton
						color="second"
						onClick={onCancel}
					>
						Cancel
					</MyButton>
				</div>
			</div>
		</>
	);
}
