import { ComponentProps } from "react";
import clsx from "clsx";
import styles from "./Button.scss";

export interface ButtonProps extends Omit<ComponentProps<"button">, "type"> {
	/**
	 * The basic style of the button, default is "button".
	 *
	 * @default "button"
	 */
	type?: "button" | "text" | "outline";

	/**
	 * Apply the active style to the button?
	 *
	 * @default false
	 */
	active?: boolean;

	/**
	 * If set, will render an anchor element with href attribute.
	 */
	href?: string;
}

export default function Button(props: ButtonProps) {
	const { type = "button", href, active, className, children, ...rest } = props;
	const nativeProps = rest as any;
	const ButtonTag = href ? "a" : "button";

	nativeProps.className = clsx(
		styles[type],
		className,
		active && styles.active,
	);
	nativeProps.type = href ? undefined : "button";

	return <ButtonTag {...nativeProps} href={href}>{children}</ButtonTag>;
}
