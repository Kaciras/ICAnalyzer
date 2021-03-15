import { Dispatch } from "react";
import { SelectBox } from "../ui";

type PreprocessFn = (input: ImageData) => Promise<ImageData[]>;

export type PreprocessConfig = Record<string, any>;

export interface PreprocessPanelProps {
	value: PreprocessConfig;
	onChange: Dispatch<PreprocessConfig>;
}

export default function PreprocessPanel(props: PreprocessPanelProps) {
	return (
		<div>
			<span>Resize:</span>
			<SelectBox>
				<option>100%</option>
				<option>50%</option>
				<option>25%</option>
				<option>12.5%</option>
				<option>6.25%</option>
			</SelectBox>
		</div>
	);
}
