import { useState } from "react";
import styles from "./DemoButton.scss";

interface DemoButtonProps {
	description: string;
	url: string;
	icon: string;
	onClick: (url: string) => Promise<void>;
}

export default function DemoButton(props: DemoButtonProps) {
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
