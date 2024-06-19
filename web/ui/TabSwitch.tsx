import { Children, cloneElement, Fragment, isValidElement, ReactNode } from "react";

export interface TabPanelBase {
	/**
	 * Is this component the current tab panel.
	 * If undefined, means the component is not controlled by TabList.
	 */
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
		return cloneElement<any>(node, { isActive: i === index });
	});

	return <Fragment>{tabPanels}</Fragment>;
}
