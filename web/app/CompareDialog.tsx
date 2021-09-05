import { Dispatch, memo, useState } from "react";
import CloseIcon from "bootstrap-icons/icons/x.svg";
import { decode } from "../features/decode";
import { InputImage } from "../features/image-worker";
import { Button, Dialog, FileDrop } from "../ui";
import { CompareData } from "./CompareSession";
import styles from "./CompareDialog.scss";
import { bytes, uniqueKey } from "../utils";

interface PreviewBoxProps {
	value: InputImage;
	index: number;
	onRemove: () => void;
}

const PreviewBox = memo((props: PreviewBoxProps) => {
	const { value, index, onRemove } = props;
	const { file, raw } = value;
	const { type, size } = file;
	const { width, height } = raw;

	function drawImage(el: HTMLCanvasElement | null) {
		el?.getContext("2d")!.putImageData(raw, 0, 0);
	}

	return (
		<li className={styles.listitem}>
			<canvas
				className={styles.canvas}
				ref={drawImage}
				width={width}
				height={height}
			/>
			<div className={styles.header}>
				{
					index === 0
						? <span>Original</span>
						: <span># {index - 1}</span>
				}
				<Button
					className={styles.reset}
					type="text"
					title="Remove"
					onClick={onRemove}
				>
					<CloseIcon/>
				</Button>
			</div>
			<div className={styles.filename}>{file.name}</div>
			<div>{type} ({width} x {height},{bytes(size)})</div>
		</li>
	);
});

PreviewBox.displayName = "PreviewBox";

export interface CompareDialogProps {
	data: CompareData | undefined;
	onAccept: Dispatch<CompareData>;
	onCancel: () => void;
}

export default function CompareDialog(props: CompareDialogProps) {
	const { data, onAccept, onCancel } = props;

	const [error, setError] = useState<Error>();
	const [images, setImages] = useState(() => data ? [data.original, ...data.changed] : []);

	function handleFileChange(files: File[]) {
		const tasks = [];
		for (const file of files) {
			tasks.push(decode(file).then(raw => ({ file, raw, id: uniqueKey() })));
		}
		Promise.all(tasks)
			.then(v => setImages([...images, ...v]))
			.catch(setError);
	}

	function handleAccept() {
		onAccept({ original: images[0], changed: images.slice(1) });
	}

	function removeAt(index: number) {
		const copy = Array.from(images);
		copy.splice(index, 1);
		setImages(copy);
	}

	const items = images.map((v, i) => (
		<PreviewBox
			key={(v as any).id}
			value={v}
			index={i}
			onRemove={() => removeAt(i)}
		/>
	));

	const invalid = images.length < 2 || Boolean(error);

	return (
		<Dialog className={styles.dialog} onClose={onCancel}>
			{
				images.length > 0 ?
					<ol className={styles.list}>{items}</ol>
					:
					<div className={styles.placeholder}>
						<p>Add at least two images</p>
						<p>The first will be the original</p>
					</div>
			}
			<div className={styles.aside}>
				<FileDrop
					className={styles.fileDrop}
					accept="image/*"
					multiple={true}
					onChange={handleFileChange}
					onError={setError}
					onSelectStart={() => setError(undefined)}
				/>
				<div className={styles.error}>{error?.message}</div>
				<div className={styles.actions}>
					<Button className="second" onClick={onCancel}>Back</Button>
					<Button disabled={invalid} onClick={handleAccept}>Next</Button>
				</div>
			</div>
		</Dialog>
	);
}
