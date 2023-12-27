import { fetchFile } from "@kaciras/utilities/browser";
import { Dispatch, useRef, useState } from "react";
import photo from "../assets/demo/photo.jpg";
import photoIcon from "../assets/demo/photo-icon.jpg";
import artwork from "../assets/demo/artwork.png";
import artworkIcon from "../assets/demo/artwork-icon.png";
import colorfulText from "../assets/demo/colorful-text.png";
import colorfulTextIcon from "../assets/demo/colorful-text-icon.png";
import { Button, Dialog, FileDrop } from "../ui/index.ts";
import { decode } from "../features/decode.ts";
import { InputImage } from "../features/image-worker.ts";
import styles from "./SelectFileDialog.scss";

interface DemoButtonProps {
	description: string;
	url: string;
	icon: string;
	onClick: Dispatch<string>;
}

function DemoButton(props: DemoButtonProps) {
	const { description, url, icon, onClick } = props;

	const [loading, setLoading] = useState(false);

	async function handleClick() {
		if (loading) {
			return;
		}
		setLoading(true);
		try {
			await onClick(url);
		} finally {
			setLoading(false);
		}
	}

	return (
		<button key={url} className={styles.card} onClick={handleClick}>
			<img
				src={icon}
				alt="icon"
				className={styles.demoIcon}
			/>
			{loading && <div className={styles.loading}/>}
			<span className={styles.demoDescription}>{description}</span>
		</button>
	);
}

interface SelectFileDialogProps {
	onCancel: () => void;
	onChange: Dispatch<InputImage>;
}

export default function SelectFileDialog(props: SelectFileDialogProps) {
	const { onCancel, onChange } = props;

	const abortController = useRef(new AbortController());
	const [error, setError] = useState<Error>();

	function accept(file: File) {
		decode(file)
			.then(raw => onChange({ file, raw }))
			.catch(setError);
	}

	function acceptUpload(files: File[]) {
		accept(files[0]);
		abortController.current.abort();
	}

	async function acceptUrl(url: string) {
		const newController = new AbortController();
		abortController.current.abort();
		abortController.current = newController;

		const { signal } = newController;
		try {
			accept(await fetchFile(url, { signal }));
		} catch (e) {
			if (e.name !== "AbortError") setError(e);
		}
	}

	return (
		<Dialog onClose={onCancel}>
			<div className="dialog-content">
				<FileDrop
					className={styles.drop}
					accept="image/*"
					onChange={acceptUpload}
					onError={setError}
					onSelectStart={() => setError(undefined)}
				/>
				<span className={styles.demoLabel}>
					Or try one of these:
				</span>
				<div className={styles.demo}>
					<DemoButton
						description="Large photo (488KB)"
						url={photo}
						icon={photoIcon}
						onClick={acceptUrl}
					/>
					<DemoButton
						description="Artwork (894KB)"
						url={artwork}
						icon={artworkIcon}
						onClick={acceptUrl}
					/>
					<DemoButton
						description="Colorful text (68KB)"
						url={colorfulText}
						icon={colorfulTextIcon}
						onClick={acceptUrl}
					/>
				</div>
			</div>
			<div className="dialog-actions">
				<span className={styles.error}>{error?.message}</span>
				<Button className="second" onClick={onCancel}>Back</Button>
			</div>
		</Dialog>
	);
}
