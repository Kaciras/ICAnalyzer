import { useEffect, useRef } from "react";
import Button, { ButtonProps } from "./Button.tsx";

export interface DownloadButtonProps extends ButtonProps {
	file: File;
}

export default function DownloadButton(props: DownloadButtonProps) {
	const { file, children, ...others } = props;

	const url = useRef("");

	useEffect(() => () => URL.revokeObjectURL(url.current), []);

	function handleClick() {
		URL.revokeObjectURL(url.current);
		const newUrl = URL.createObjectURL(file);
		url.current = newUrl;

		const a = document.createElement("a");
		a.href = newUrl;
		a.download = file.name;

		a.click(); // It seems no need to mount to document.
	}

	return <Button {...others} onClick={handleClick}>{children}</Button>;
}
