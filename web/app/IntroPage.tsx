import { Button, IconButton } from "../ui";
import style from "./AnalyzePage.scss";
import GitHubIcon from "../assets/github-logo.svg";

interface IntroPageProps {
	onStart: () => void;
}

export default function IntroPage(props: IntroPageProps) {
	const { onStart } = props;

	return (
		<div>
			<section>
				<Button onClick={onStart}>Try it!</Button>

				<IconButton
					href="https://github.com/Kaciras/ICAnalyze"
					className={style.iconButton}
				>
					<GitHubIcon/>
					Source Code
				</IconButton>
			</section>
			<section>
				TODO
			</section>
		</div>
	);
}
