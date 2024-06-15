import { memo, ReactNode } from "react";
import clsx from "clsx";
import { BsSliders, BsType } from "react-icons/bs";
import { OptionState, OptionStateMap, OptionType } from "./index.ts";
import { Button } from "../ui/index.ts";
import { Merger } from "../mutation.ts";
import styles from "./OptionsForm.scss";

interface OptionProps {
	template: OptionType;
	state: OptionState;
	onChange: Merger<OptionState>;
}

const Option = memo((props: OptionProps) => {
	const { template, state, onChange } = props;
	const { isVariable } = state;
	const { OptionField } = template;

	let title: string;
	let clazz: string;
	let iconChildren: ReactNode;

	if (isVariable) {
		clazz = styles.variable;
		title = "Range Mode";
		iconChildren = <BsSliders/>;
	} else {
		clazz = styles.constant;
		title = "Constant Mode";
		iconChildren = <BsType/>;
	}

	function toggle() {
		onChange.set("isVariable", !isVariable);
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

Option.displayName = "Option";

export interface OptionsFormProps {
	className?: string;
	templates: OptionType[];
	state: OptionStateMap;
	onChange: Merger<OptionStateMap>;
}

export default function OptionsForm(props: OptionsFormProps) {
	const { templates, className, state, onChange } = props;

	const items = templates.map(template => {
		const { id } = template;

		return (
			<Option
				template={template}
				key={id}
				state={state[id]}
				onChange={onChange.sub(id)}
			/>
		);
	});

	return <form className={clsx(styles.form, className)}>{items}</form>;
}
