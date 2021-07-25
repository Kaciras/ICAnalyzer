import { Children, cloneElement, Dispatch, isValidElement, KeyboardEvent, ReactNode } from "react";
import clsx from "clsx";
import { NOOP } from "../utils";

export interface TabListProps {
	className?: string;
	activeClass?: string;
	index: number;
	onChange: Dispatch<number>;
	children: ReactNode;
}

export default function TabList(props: TabListProps) {
	const { className, activeClass, index, onChange, children } = props;

	const tabButtons = Children.map(children, (child, i) => {
		if (!isValidElement(child)) {
			return child;
		}
		const { className, onClick = NOOP } = child.props;
		const selected = i === index;

		function handleClick(event: MouseEvent) {
			onChange(i);
			onClick(event);
		}

		const modified = {
			"aria-selected": selected,
			role: "tab",
			...child.props,
			className: clsx(className, selected && activeClass),
			onClick: handleClick,
		};
		return cloneElement(child, modified);
	});

	function handleKeyUp(event: KeyboardEvent) {
		const last = tabButtons!.length - 1;
		let i = index;

		switch (event.key) {
			case "ArrowLeft":
			case "ArrowUp":
				i -= 1;
				break;
			case "ArrowRight":
			case "ArrowDown":
				i += 1;
				break;
			default:
				return;
		}

		onChange(i > last ? 0 : i < 0 ? last : i);
	}

	return (
		<div
			className={className}
			tabIndex={0}
			role="tablist"
			onKeyUp={handleKeyUp}
		>
			{tabButtons}
		</div>
	);
}
