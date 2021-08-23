import { Children, cloneElement, Dispatch, isValidElement, ReactNode } from "react";

export interface RadioGroupProps {
	value: string;

	className?: string;
	name?: string;
	disabled?: boolean;

	onChange: Dispatch<string>;
	children: ReactNode;
}

export default function RadioGroup(props: RadioGroupProps) {
	const { className, name, value, disabled, onChange, children } = props;

	const tabButtons = Children.map(children, child => {
		if (!isValidElement(child)) {
			return child;
		}
		const radioValue = child.props.value;

		const propsAddon = {
			checked: value === radioValue,
			name,
			disabled,
			onChange: () => onChange(radioValue),
		};
		return cloneElement(child, propsAddon);
	});

	return <div className={className}>{tabButtons}</div>;
}
