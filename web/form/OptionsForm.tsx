import { Dispatch, ReactNode } from "react";
import clsx from "clsx";
import TypeIcon from "bootstrap-icons/icons/type.svg";
import SliderIcon from "bootstrap-icons/icons/sliders.svg";
import { OptionMode, OptionStateMap, OptionType } from "./index";
import { Button } from "../ui";
import styles from "./OptionsForm.scss";

interface ModeSwitcherProps {
	mode: OptionMode;
	onChange: Dispatch<OptionMode>;
}

function ModeSwitcher(props: ModeSwitcherProps) {
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

export interface OptionsFormProps {
	className?: string;
	templates: OptionType[];
	state: OptionStateMap;
	onChange: Dispatch<OptionStateMap>;
}

export default function OptionsForm(props: OptionsFormProps) {
	const { templates, className, state, onChange } = props;
	const items = [];

	for (const template of templates) {
		const { id, OptionField } = template;

		function handleValueChange(value: any) {
			const newOption = { ...state[id], value };
			onChange({ ...state, [id]: newOption });
		}

		function handleRangeChange(range: any) {
			const newOption = { ...state[id], range };
			onChange({ ...state, [id]: newOption });
		}

		function handleModeChange(mode: OptionMode) {
			const newOption = { ...state[id], mode };
			onChange({ ...state, [id]: newOption });
		}

		items.push(
			<ModeSwitcher
				mode={state[id].mode}
				onChange={handleModeChange}
			/>,
			<OptionField
				{...state[id]}
				key={id}
				onValueChange={handleValueChange}
				onRangeChange={handleRangeChange}
				onModeChange={handleModeChange}
			/>,
		);
	}

	return <form className={clsx(styles.form, className)}>{items}</form>;
}
