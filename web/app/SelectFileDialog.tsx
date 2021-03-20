import { ChangeEvent, useRef, useState } from "react";
import clsx from "clsx";
import ImageIcon from "bootstrap-icons/icons/image.svg";
import largePhoto from "../assets/demo/large-photo.jpg";
import largePhotoIcon from "../assets/demo/large-photo-icon.jpg";
import artwork from "../assets/demo/artwork.jpg";
import artworkIcon from "../assets/demo/artwork-icon.jpg";
import colorfulTextIcon from "../assets/demo/colorful-text-icon.png";
import colorfulText from "../assets/demo/colorful-text.png";
import { Button, Dialog } from "../ui";
import { getFileFromUrl } from "../utils";
import { decode } from "../decode";
import DemoButton from "./DemoButton";
import styles from "./SelectFileDialog.scss";

const demos = [
	{
		description: "Large photo (2.8MB)",
		url: largePhoto,
		icon: largePhotoIcon,
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

/**
 * dragenter & dragleave can be triggered on crossing children element boundary,
 */
function useBoundaryCounter() {
	const [isInArea, setInArea] = useState(false);
	const counter = useRef(0);

	function enter() {
		setInArea(++counter.current > 0);
	}

	function leave() {
		setInArea(--counter.current > 0);
	}

	function reset() {
		counter.current = 0;
		setInArea(false);
	}

	return { isInArea, enter, leave, reset };
}

const initController = new AbortController();

interface Props {
	onCancel: () => void;
	onFileChange: (file: File, image: ImageData) => void;
}

export default function SelectFileDialog(props: Props) {
	const { onCancel, onFileChange } = props;

	const boundary = useBoundaryCounter();
	const abortController = useRef(initController);
	const [error, setError] = useState("");

	function accept(file: File) {
		decode(file)
			.then(image => onFileChange(file, image))
			.catch(() => setError("Can not decode file as image."));
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

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		abortController.current.abort();
		const { files } = event.currentTarget;
		if (files?.length) accept(files[0]);
	}

	function handleDrop(event: React.DragEvent) {
		event.preventDefault();
		boundary.reset();
		abortController.current.abort();

		const { items } = event.dataTransfer;
		const file = items[0].getAsFile();

		if (file) {
			accept(file);
		} else {
			setError("The dropped item is not a file");
		}
	}

	const demoButtons = demos.map(demo => <DemoButton {...demo} key={demo.url} onClick={acceptUrl}/>);

	return (
		<Dialog onClose={onCancel}>
			<div className="dialog-content">
				<label
					className={clsx(styles.uploadFile, { [styles.dragging]: boundary.isInArea })}
					tabIndex={0}
					onDragEnter={boundary.enter}
					onDragOver={e => e.preventDefault()}
					onDrop={handleDrop}
					onDragLeave={boundary.leave}
				>
					<div>
						<span className={styles.icon}>
							<ImageIcon/>
						</span>
						<span className={styles.text}>
							Drag & drop
						</span>
					</div>
					<div className={styles.text}>
						Or select an image
					</div>
					<input
						className={styles.fileInput}
						name="file"
						type="file"
						accept="image/*"
						onChange={handleFileChange}
					/>
				</label>
				<span className={styles.demoLabel}>
					Or try one of these:
				</span>
				<div className={styles.demo}>{demoButtons}</div>
			</div>
			<div className="dialog-actions">
				<span className={styles.error}>{error}</span>
				<Button color="second" onClick={onCancel}>Back</Button>
			</div>
		</Dialog>
	);
}
