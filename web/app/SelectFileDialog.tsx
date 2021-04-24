import { Dispatch, useRef, useState } from "react";
import photo from "../assets/demo/photo.jpg";
import photoIcon from "../assets/demo/photo-icon.jpg";
import artwork from "../assets/demo/artwork.jpg";
import artworkIcon from "../assets/demo/artwork-icon.jpg";
import colorfulText from "../assets/demo/colorful-text.png";
import colorfulTextIcon from "../assets/demo/colorful-text-icon.png";
import { Button, Dialog, FileDrop } from "../ui";
import { getFileFromUrl } from "../utils";
import { decode } from "../decode";
import { InputImage } from "./index";
import styles from "./SelectFileDialog.scss";

const demos = [
	{
		description: "Large photo (488KB)",
		url: photo,
		icon: photoIcon,
	},
	{
		description: "Artwork (408KB)",
		url: artwork,
		icon: artworkIcon,
	},
	{
		description: "Colorful text (68KB)",
		url: colorfulText,
		icon: colorfulTextIcon,
	},
];

interface DemoButtonProps {
	description: string;
	url: string;
	icon: string;
	onClick: (url: string) => Promise<void>;
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
	const [error, setError] = useState<string>();

	function accept(file: File) {
		decode(file)
			.then(raw => onChange({ file, raw }))
			.catch(e => setError(e.message));
	}

	function acceptUpload(file: File) {
		accept(file);
		abortController.current.abort();
	}

	async function acceptUrl(url: string) {
		const newController = new AbortController();
		abortController.current.abort();
		abortController.current = newController;

		const { signal } = newController;
		try {
			accept(await getFileFromUrl(url, signal));
		} catch (e) {
			if (e.name !== "AbortError") throw e;
		}
	}

	const demoButtons = demos.map(demo =>
		<DemoButton {...demo} key={demo.url} onClick={acceptUrl}/>,
	);

	return (
		<Dialog onClose={onCancel}>
			<div className="dialog-content">
				<FileDrop
					className={styles.drop}
					onChange={acceptUpload}
					onError={setError}
					onStart={() => setError(undefined)}
				/>
				<span className={styles.demoLabel}>
					Or try one of these:
				</span>
				<div className={styles.demo}>{demoButtons}</div>
			</div>
			<div className="dialog-actions">
				<span className={styles.error}>{error}</span>
				<Button className="second" onClick={onCancel}>Back</Button>
			</div>
		</Dialog>
	);
}
