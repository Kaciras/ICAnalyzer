import React, { useMemo, useState } from "react";
import { MyButton } from "../ui";
import Styles from "./ProgressPanel.scss";
import { debounce } from "../utils";

const formatter = new Intl.RelativeTimeFormat("en", { maximumFractionDigits: 1});

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
	const ms = (max - value) / value * (performance.now() - start);

	const remaining = Number.isNaN(ms)
		? "----"
		: formatter.format(ms / 1000, "seconds");

	return (
		<>
			<h1>Encoding...</h1>
			<div className={Styles.textProgress}>
				<span>{value}/{max}</span>
				<span>Remaining: {remaining}</span>
			</div>
			<progress value={value} max={max}/>
			<div className={Styles.buttons}>
				<MyButton onClick={onCancel}>Cancel</MyButton>
			</div>
		</>
	);
}
