import { Dispatch, ReactNode } from "react";
import TypeIcon from "bootstrap-icons/icons/type.svg";
import SliderIcon from "bootstrap-icons/icons/sliders.svg";
import { Button } from "../ui";
import styles from "./ModeSwitcher.scss";
import { OptionMode } from "../codecs";

export interface ModeSwitcherProps {
	mode: OptionMode;
	onChange: Dispatch<OptionMode>;
}

export default function ModeSwitcher(props: ModeSwitcherProps) {
	const { mode, onChange } = props;

	let title: string;
	let clazz: string;
	let iconChildren: ReactNode;

	switch (mode) {
		case OptionMode.Constant:
			title = "Constant Mode";
			clazz = styles.constant;
			iconChildren = <TypeIcon/>;
			break;
		case OptionMode.Range:
			title = "Range Mode";
			clazz = styles.variable;
			iconChildren = <SliderIcon/>;
			break;
	}

	function toggle() {
		onChange((mode + 1) % 2);
	}

	return (
		<Button
			className={clazz}
			title={title}
			type="text"
			onClick={toggle}
		>
			{iconChildren}
		</Button>
	);
}
