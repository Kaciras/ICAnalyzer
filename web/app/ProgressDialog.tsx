import React, { useMemo, useState } from "react";
import { Dialog, MyButton } from "../ui";
import Styles from "./ProgressDialog.scss";
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

export default function ProgressDialog(props: ProgressPanelProps) {
	const { value, max, onCancel } = props;

	const [start] = useState(() => performance.now());
	const debounced = useMemo(() => debounce(500, calcTime), []);

	const ms = debounced(start, value, max);
	const remaining = Number.isNaN(ms)
		? "----"
		: formatter.format(~~(ms / 1000), "seconds");

	return (
		<Dialog>
			<div className={Styles.content}>
				<h1>Encoding...</h1>
				<div className={Styles.text}>
					<span>{value}/{max}</span>
					<span>Remaining: {remaining}</span>
				</div>
				<progress
					value={value}
					max={max}
					className={Styles.progress}
				/>
			</div>
			<div className={Styles.buttons}>
				<MyButton color="second" onClick={onCancel}> Cancel </MyButton>
			</div>
		</Dialog>
	);
}
