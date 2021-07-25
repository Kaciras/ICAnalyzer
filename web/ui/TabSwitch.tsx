import { Children, cloneElement, Fragment, isValidElement, ReactNode } from "react";

export interface TabPanelBase {
	isActive?: boolean;
}

export interface TabSwitchProps {
	index: number;
	children: ReactNode;
}

export default function TabSwitch(props: TabSwitchProps) {
	const { index, children } = props;

	const tabPanels = Children.map(children, (node, i) => {
		if (!isValidElement(node)) {
			return node;
		}
		return cloneElement(node, { isActive: i === index });
	});

	return <Fragment>{tabPanels}</Fragment>;
}
