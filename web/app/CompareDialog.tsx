import { Dispatch, useEffect, useRef, useState } from "react";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { decode } from "../decode";
import { Button, Dialog, FileDrop } from "../ui";
import { InputImage } from "./index";
import { CompareData } from "./CompareSession";
import styles from "./CompareDialog.scss";

interface UploadBoxProps {
	name: string;
	onChange: Dispatch<InputImage>;
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
	onReset: () => void;
}

function PreviewBox(props: PreviewBoxProps) {
	const { value, name, onReset } = props;
	const { file, data } = value;

	const canvas = useRef<HTMLCanvasElement>(null);

	function draw() {
		if (value) {
			const ctx = canvas.current!.getContext("2d");
			ctx?.putImageData(value.data, 0, 0);
		}
	}

	useEffect(draw, [value]);

	return (
		<section className={styles.section}>
			<div className={styles.header}>
				<h3 className={styles.title}>{name}</h3>
				<Button
					className={styles.reset}
					type="text"
					title="Reset"
					onClick={onReset}
				>
					<CloseIcon/>
				</Button>
			</div>
			<canvas
				className={styles.canvas}
				ref={canvas}
				width={data.width}
				height={data.height}
			/>
			<div className={styles.info}>{file.name}</div>
		</section>
	);
}

type InputState = InputImage | undefined;

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

	function createSection(name: string, value: InputState, setValue: Dispatch<InputState>) {
		return value
			? <PreviewBox name={name} value={value} onReset={() => setValue(undefined)}/>
			: <UploadBox name={name} onChange={setValue} onError={setError}/>;
	}

	const isValid = origin && output && !error;

	return (
		<Dialog onClose={onCancel}>
			<div className={styles.body}>
				{createSection("Origin image", origin, setOrigin)}
				{createSection("Changed image", output, setOutput)}
			</div>
			<div className="dialog-actions">
				<span className={styles.error}>{error}</span>
				<Button className="second" onClick={onCancel}>Back</Button>
				<Button disabled={!isValid} onClick={handleAccept}>Next</Button>
			</div>
		</Dialog>
	);
}
