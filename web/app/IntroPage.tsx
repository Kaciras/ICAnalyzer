import { Button } from "../ui";

interface IntroPageProps {
	onStart: () => void;
}

export default function IntroPage(props: IntroPageProps) {
	const { onStart } = props;

	return (
		<div>
			<section>
				<Button onClick={onStart}>Try it!</Button>
			</section>
			<section>
				TODO
			</section>
		</div>
	);
}
