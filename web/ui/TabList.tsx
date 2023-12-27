import { noop } from "@kaciras/utilities/browser";
import { Children, cloneElement, Dispatch, isValidElement, KeyboardEvent, ReactNode, useRef } from "react";

export interface TabListProps {
	className?: string;
	index: number;
	onChange: Dispatch<number>;
	children: ReactNode;
}

export default function TabList(props: TabListProps) {
	const { className, index, onChange, children } = props;

	/**
	 * To handle focus changing, we need to track elements.
	 */
	const localRef = useRef<HTMLElement[]>([]);

	const tabButtons = Children.map(children, (child, i) => {
		if (!isValidElement(child)) {
			return child;
		}
		const { onClick = noop, ref = noop } = child.props;
		const selected = i === index;

		function handleClick(event: MouseEvent) {
			onChange(i);
			onClick(event);
		}

		function callback(el: HTMLElement) {
			if (typeof ref !== "object") {
				ref();
			} else if (ref) {
				ref.current = el;
			}
			localRef.current[i] = el;
		}

		const propsAddon = {
			"aria-selected": selected,
			role: "tab",
			tabIndex: selected ? 0 : -1,
			ref: callback,
			onClick: handleClick,
		};
		return cloneElement(child, propsAddon);
	});

	const count = tabButtons!.length;
	localRef.current.length = count;

	function handleKeyDown(event: KeyboardEvent) {
		let i = index;

		switch (event.key) {
			case "Home":
				i = 0;
				break;
			case "End":
				i = count - 1;
				break;
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

		event.preventDefault();
		i = (i + count) % count;
		onChange(i);
		localRef.current[i].focus();
	}

	return (
		<div
			className={className}
			role="tablist"
			onKeyDown={handleKeyDown}
		>
			{tabButtons}
		</div>
	);
}
