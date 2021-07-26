import { Children, cloneElement, Dispatch, isValidElement, KeyboardEvent, ReactNode, useRef } from "react";
import { NOOP } from "../utils";

export interface TabListProps {
	className?: string;
	index: number;
	onChange: Dispatch<number>;
	children: ReactNode;
}

export default function TabList(props: TabListProps) {
	const { className, index, onChange, children } = props;

	const localRef = useRef<HTMLElement[]>([]);

	const tabButtons = Children.map(children, (child, i) => {
		if (!isValidElement(child)) {
			return child;
		}
		const { onClick = NOOP, ref = NOOP } = child.props;
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

	function handleKeyUp(event: KeyboardEvent) {
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

		const last = count - 1;
		i = i > last ? 0 : i < 0 ? last : i;
		onChange(i);
		localRef.current[i].focus();
	}

	return (
		<div
			className={className}
			role="tablist"
			onKeyUp={handleKeyUp}
		>
			{tabButtons}
		</div>
	);
}
