import { Children, cloneElement, Dispatch, isValidElement, ReactNode } from "react";

export interface RadioGroupProps<T> {
	value: T;

	className?: string;
	name?: string;
	disabled?: boolean;

	onChange: Dispatch<T>;

	children: ReactNode;
}

export default function RadioGroup<T>(props: RadioGroupProps<T>) {
	const { className, name, value, disabled, onChange, children } = props;

	const radioBoxes = Children.map(children, child => {
		if (!isValidElement(child)) {
			return child;
		}
		const radioValue = child.props.value;

		const propsAddon = {
			checked: value === radioValue,
			name,
			disabled,
			onSelected: onChange,
		};
		return cloneElement(child, propsAddon);
	});

	return <div className={className}>{radioBoxes}</div>;
}
