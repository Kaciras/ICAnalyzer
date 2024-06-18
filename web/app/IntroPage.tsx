import clsx from "clsx";
import { TbBrandGithub } from "react-icons/tb";
import banner from "../assets/intro-banner.png";
import { Button } from "../ui/index.ts";
import styles from "./IntroPage.scss";
import i18n from "../i18n.ts";

interface IntroPageProps {
	onEncode: () => void;
	onCompare: () => void;
}

export default function IntroPage(props: IntroPageProps) {
	const { onEncode, onCompare } = props;

	return (
		<>
			<section className={styles.header}>
				<img className={styles.banner} alt="banner" src={banner}/>

				<div>
					<h1 className={styles.title}>
						ICAnalyzer
					</h1>
					<h2 className={styles.subTitle}>
						{i18n("ICAnalyzerIntro")}
					</h2>

					<Button
						className={styles.bigButton}
						type="outline"
						onClick={onEncode}
					>
						Convert
					</Button>
					<Button
						className={styles.bigButton}
						type="outline"
						onClick={onCompare}
					>
						Compare
					</Button>
					<Button
						className={clsx(styles.bigButton, "second")}
						type="outline"
						href="https://github.com/Kaciras/ICAnalyzer"
					>
						<TbBrandGithub className={styles.github}/>
						{i18n("SourceCode")}
					</Button>
				</div>

				<div className={styles.unsplash}>
					Photo by
					<a
						className={styles.link}
						href="https://unsplash.com/@veverkolog?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
					>
						Dušan veverkolog
					</a>
					on
					<a
						className={styles.link}
						href="https://unsplash.com/s/photos/eagle?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
					>
						Unsplash
					</a>
				</div>
			</section>
			<section className={styles.links}>
				<div className={styles.card}>
					<h2>Documents</h2>
					<a href="https://github.com/Kaciras/ICAnalyzer/wiki/Tutorial-(Chinese)">Tutorial (Chinese)</a>
				</div>
				<div className={styles.card}>
					<h2>Articles</h2>
					<a href="https://blog.kaciras.com/article/24/analyze-WebP-encode-options">WebP 参数分析</a>
					<a href="https://blog.kaciras.com/article/23/icanalyzer-development-log">ICAnalyzer 开发小记</a>
				</div>
			</section>
		</>
	);
}
