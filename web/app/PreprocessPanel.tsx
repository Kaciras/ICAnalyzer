import React from "react";

export interface PreprocessPanelProps {

}

export default function PreprocessPanel(props: PreprocessPanelProps) {
	return (
		<div>
			<span>Resize:</span>
			<select>
				<option>100</option>
				<option>50</option>
				<option>25</option>
				<option>12.5</option>
				<option>6.25</option>
			</select>
		</div>
	);
}