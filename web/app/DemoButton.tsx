import React, { useState } from "react";
import Styles from "./DemoButton.scss";

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
		<div key={url} className={Styles.card} onClick={handleClick}>
			<img
				src={icon}
				alt="icon"
				className={Styles.demoIcon}
			/>
			{loading && <div className={Styles.loading}/>}
			<span className={Styles.demoDescription}>{description}</span>
		</div>
	);
}
