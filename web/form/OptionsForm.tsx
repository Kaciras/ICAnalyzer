import { memo, ReactNode } from "react";
import clsx from "clsx";
import TypeIcon from "bootstrap-icons/icons/type.svg";
import SliderIcon from "bootstrap-icons/icons/sliders.svg";
import { OptionMode, OptionState, OptionStateMap, OptionType } from "./index";
import { Button } from "../ui";
import { ShallowMerger } from "../mutation";
import styles from "./OptionsForm.scss";

interface OptionItemProps {
	template: OptionType;
	state: OptionState;
	onChange: ShallowMerger;
}

const OptionItem = memo((props: OptionItemProps) => {
	const { template, state, onChange } = props;
	const { mode } = state;
	const { OptionField } = template;

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
		onChange.merge("mode", (mode + 1) % 2);
	}

	return (
		<>
			<Button
				className={clazz}
				title={title}
				type="text"
				onClick={toggle}
			>
				{iconChildren}
			</Button>
			<OptionField
				{...state}
				onValueChange={onChange.sub("value")}
				onRangeChange={onChange.sub("range")}
			/>
		</>
	);
});

OptionItem.displayName = "OptionItem";

export interface OptionsFormProps {
	className?: string;
	templates: OptionType[];
	state: OptionStateMap;
	onChange: ShallowMerger;
}

export default function OptionsForm(props: OptionsFormProps) {
	const { templates, className, state, onChange } = props;

	const items = templates.map(template => {
		const { id } = template;

		return (
			<OptionItem
				template={template}
				key={id}
				state={state[id]}
				onChange={onChange.sub(id)}
			/>
		);
	});

	return <form className={clsx(styles.form, className)}>{items}</form>;
}
