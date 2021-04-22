import { Button } from "../ui";
import styles from "./IntroPage.scss";
import GitHubIcon from "../assets/github-logo.svg";
import banner from "../assets/intro-banner.png";

interface IntroPageProps {
	onEncode: () => void;
	onCompare: () => void;
}

export default function IntroPage(props: IntroPageProps) {
	const { onEncode, onCompare } = props;

	return (
		<div>
			<section className={styles.header}>
				<img className={styles.banner} alt="banner" src={banner}/>

				<div>
					<h1 className={styles.title}>
						ICAnalyze
					</h1>
					<h2 className={styles.subTitle}>
						Image Codec & Quality analyze tool
					</h2>

					<Button
						className={styles.bigButton}
						type="outline"
						onClick={onEncode}
					>
						Try it!
					</Button>
					<Button
						className={styles.bigButton}
						type="outline"
						onClick={onCompare}
					>
						Compare images
					</Button>
					<Button
						className={styles.bigButton + " second"}
						type="outline"
						href="https://github.com/Kaciras/ICAnalyze"
					>
						<GitHubIcon className={styles.github}/>
						Source Code
					</Button>
				</div>

				<div className={styles.unsplash}>
					Photo by
					<a className={styles.link} href="https://unsplash.com/@veverkolog?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Dušan veverkolog</a>
					on
					<a className={styles.link} href="https://unsplash.com/s/photos/eagle?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
				</div>
			</section>
			<section className={styles.section}>
				TODO
			</section>
		</div>
	);
}
