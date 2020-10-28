import React, { useState } from "react";
import { MyButton } from "../ui";
import Styles from "./ProgressPanel.scss";

const formatter = new Intl.RelativeTimeFormat("en");

interface ProgressPanelProps {
	max: number;
	value: number;
	onCancel: () => void;
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
