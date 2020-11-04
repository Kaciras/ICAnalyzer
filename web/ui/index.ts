import CheckIcon from "../assets/check_box.svg";
import CheckIconActive from "../assets/check_box-checked.svg";
import RadioIcon from "../assets/radio_box.svg";
import RadioIconActive from "../assets/radio_box-checked.svg";
import CheckBoxBase, { CheckBoxProps } from "./CheckBoxBase";

export function CheckBox(props: CheckBoxProps) {
	return CheckBoxBase({ ...props, Icon: CheckIcon, IconChecked: CheckIconActive });
}

export function RadioBox(props: CheckBoxProps) {
	return CheckBoxBase({ ...props, Icon: RadioIcon, IconChecked: RadioIconActive });
}

export { default as IconButton } from "./IconButton";
export { default as RangeInput } from "./RangeInput";
export { default as Button } from "./Button";
export { default as NumberInput } from "./NumberInput";
export { default as Dialog } from "./Dialog";
