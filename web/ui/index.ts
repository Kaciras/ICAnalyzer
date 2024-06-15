import { memo } from "react";
import {
	MdCheckBox,
	MdCheckBoxOutlineBlank,
	MdOutlineRadioButtonChecked,
	MdOutlineRadioButtonUnchecked,
} from "react-icons/md";
import CheckBoxBase, { CheckBoxProps } from "./CheckBoxBase.tsx";

export const CheckBox = memo((props: CheckBoxProps) => {
	return CheckBoxBase({
		...props,
		type: "checkbox",
		Icon: MdCheckBoxOutlineBlank,
		IconChecked: MdCheckBox,
	});
});

export const RadioBox = memo((props: CheckBoxProps) => {
	return CheckBoxBase({
		...props,
		type: "radio",
		Icon: MdOutlineRadioButtonUnchecked,
		IconChecked: MdOutlineRadioButtonChecked,
	});
});

CheckBox.displayName = "CheckBox";
RadioBox.displayName = "RadioBox";

export { default as Slider } from "./Slider.tsx";
export { default as Button } from "./Button.tsx";
export { default as DownloadButton } from "./DownloadButton.tsx";
export { default as NumberInput } from "./NumberInput.tsx";
export { default as Dialog } from "./Dialog.tsx";
export { default as PinchZoom } from "./PinchZoom.tsx";
export { default as SelectBox } from "./SelectBox.tsx";
export { default as SwitchButton } from "./SwitchButton.tsx";
export { default as FileDrop } from "./FileDrop.tsx";
export { default as ColorPicker } from "./ColorPicker.tsx";
export { default as TabList } from "./TabList.tsx";
export { default as TabSwitch } from "./TabSwitch.tsx";
export { default as RadioGroup } from "./RadioGroup.tsx";
export { default as ZoomControl } from "./ZoomControl.tsx";
