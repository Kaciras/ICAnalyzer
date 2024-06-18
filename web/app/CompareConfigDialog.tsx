import { Dispatch } from "react";
import { useLocalStorage } from "../hooks.ts";
import i18n from "../i18n.ts";
import { Button, Dialog } from "../ui/index.ts";
import MeasurePanel, { getMeasureOptions } from "./MeasurePanel.tsx";
import { MeasureOptions } from "../features/measurement.ts";
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
		<Dialog name={i18n("MeasureOptions")} className={styles.dialog} onClose={onClose}>
			<h2 className={styles.title}>
				{i18n("MeasureOptions")}
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
