import { MouseEvent } from "react";

export function avoidMouseFocus(event: MouseEvent<HTMLElement>) {
	event.currentTarget.blur();
}
