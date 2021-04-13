import { Dispatch, memo, useState } from "react";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { decode } from "../decode";
import { Button, Dialog, FileDrop } from "../ui";
import { InputImage } from "./index";
import { CompareData } from "./CompareSession";
import styles from "./CompareDialog.scss";

type InputState = InputImage | undefined;

interface UploadBoxProps {
	name: string;
	onChange: Dispatch<InputState>;
	onError: Dispatch<string | undefined>;
}

function UploadBox(props: UploadBoxProps) {
	const { name, onChange, onError } = props;

	function onFileChange(file: File) {
		return decode(file)
			.then(data => onChange({ file, data }))
			.catch(e => onError(e.message));
	}

	return (
		<section className={styles.section}>
			<div className={styles.header}>
				<h3 className={styles.title}>{name}</h3>
			</div>
			<FileDrop
				className={styles.fileDrop}
				onChange={onFileChange}
				onError={onError}
				onStart={() => onError(undefined)}
			/>
		</section>
	);
}

interface PreviewBoxProps {
	value: InputImage;
	name: string;
	onChange: Dispatch<InputState>;
}

const PreviewBox = memo((props: PreviewBoxProps) => {
	const { value, name, onChange } = props;
	const { file, data } = value;

	function drawImage(el: HTMLCanvasElement) {
		el?.getContext("2d")!.putImageData(data, 0, 0);
	}

	return (
		<section className={styles.section}>
			<div className={styles.header}>
				<h3 className={styles.title}>{name}</h3>
				<Button
					className={styles.reset}
					type="text"
					title="Reset"
					onClick={() => onChange(undefined)}
				>
					<CloseIcon/>
				</Button>
			</div>
			<canvas
				className={styles.canvas}
				ref={drawImage}
				width={data.width}
				height={data.height}
			/>
			<div className={styles.info}>{file.name}</div>
		</section>
	);
});

PreviewBox.displayName = "PreviewBox";

export interface CompareDialogProps {
	data?: CompareData;
	onAccept: Dispatch<CompareData>;
	onCancel: () => void;
}

export default function CompareDialog(props: CompareDialogProps) {
	const { data, onAccept, onCancel } = props;

	const [origin, setOrigin] = useState<InputState>(data?.origin);
	const [output, setOutput] = useState<InputState>(data?.output);
	const [error, setError] = useState<string>();

	function handleAccept() {
		onAccept({ origin: origin!, output: output! });
	}

	function section(name: string, value: InputState, setValue: Dispatch<InputState>) {
		return value
			? <PreviewBox name={name} value={value} onChange={setValue}/>
			: <UploadBox name={name} onChange={setValue} onError={setError}/>;
	}

	const isValid = origin && output && !error;

	return (
		<Dialog onClose={onCancel}>
			<div className={styles.body}>
				{section("Origin image", origin, setOrigin)}
				{section("Changed image", output, setOutput)}
			</div>
			<div className="dialog-actions">
				<span className={styles.error}>{error}</span>
				<Button className="second" onClick={onCancel}>Back</Button>
				<Button disabled={!isValid} onClick={handleAccept}>Next</Button>
			</div>
		</Dialog>
	);
}
