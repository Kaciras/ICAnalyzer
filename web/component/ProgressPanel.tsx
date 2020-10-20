import React from "react";

interface ProgressPanelProps {
	max: number;
	value: number;
	onCancel: () => void;
}

export default function ProgressPanel(props: ProgressPanelProps) {
	const { value, max, onCancel } = props;
	return (
		<>
			<span>{value}/{max}</span>
			<progress id="progress" value={value} max={max}/>
			<button onClick={onCancel}>Cancel</button>
		</>
	);
}
