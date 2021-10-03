import { memo } from "react";
import CheckBoxBase, { CheckBoxProps } from "./CheckBoxBase";
import CheckIcon from "../assets/check_box.svg";
import CheckIconActive from "../assets/check_box-checked.svg";
import RadioIcon from "../assets/radio_box.svg";
import RadioIconActive from "../assets/radio_box-checked.svg";

export const CheckBox = memo((props: CheckBoxProps) => {
	return CheckBoxBase({ ...props, type: "checkbox", Icon: CheckIcon, IconChecked: CheckIconActive });
});

export const RadioBox = memo((props: CheckBoxProps) => {
	return CheckBoxBase({ ...props, type: "radio", Icon: RadioIcon, IconChecked: RadioIconActive });
});

CheckBox.displayName = "CheckBox";
RadioBox.displayName = "RadioBox";

export { default as Slider } from "./Slider";
export { default as Button } from "./Button";
export { default as DownloadButton } from "./DownloadButton";
export { default as NumberInput } from "./NumberInput";
export { default as Dialog } from "./Dialog";
export { default as PinchZoom } from "./PinchZoom";
export { default as SelectBox } from "./SelectBox";
export { default as SwitchButton } from "./SwitchButton";
export { default as FileDrop } from "./FileDrop";
export { default as ColorPicker } from "./ColorPicker";
export { default as TabList } from "./TabList";
export { default as TabSwitch } from "./TabSwitch";
export { default as RadioGroup } from "./RadioGroup";
