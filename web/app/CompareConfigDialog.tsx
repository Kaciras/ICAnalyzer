import { Dispatch } from "react";
import { useLocalStorage } from "../hooks";
import { Button, Dialog } from "../ui";
import MeasurePanel, { getMeasureOptions } from "./MeasurePanel";
import { MeasureOptions } from "../features/measurement";
import styles from "./CompressConfigDialog.scss";

interface CompareConfigDialogProps {
	onClose: () => void;
	onStart: Dispatch<MeasureOptions>;
	onSelectFile: () => void;
}

export default function CompareConfigDialog(props: CompareConfigDialogProps) {
	const { onStart, onClose, onSelectFile } = props;

	const [options, setOptions] = useLocalStorage("Measure", getMeasureOptions);

	return (
		<Dialog name="Compare config" className={styles.dialog} onClose={onClose}>
			<h2 className={styles.title}>
				Measure Options
			</h2>
			<MeasurePanel
				value={options}
				onChange={setOptions}
			/>
			<div className="dialog-actions">
				<Button onClick={onSelectFile}>Select files...</Button>
				<Button className="second" onClick={onClose}>Cancel</Button>
				<Button onClick={() => onStart(options)}>Next</Button>
			</div>
		</Dialog>
	);
}