import { ReactNode, useEffect, useRef } from "react";
import Button, { ButtonProps } from "./Button";

export interface DownloadButtonProps extends ButtonProps {
	buffer: ArrayBuffer;
	mime: string;
	filename: string;
	children: ReactNode;
}

export default function DownloadButton(props: DownloadButtonProps) {
	const { buffer, filename, mime, children, ...others } = props;

	const url = useRef("");

	useEffect(() => () => URL.revokeObjectURL(url.current), []);

	function download() {
		const blob = new Blob([buffer], { type: mime });

		URL.revokeObjectURL(url.current);
		const newUrl = URL.createObjectURL(blob);
		url.current = newUrl;

		const a = document.createElement("a");
		a.href = newUrl;
		a.download = filename;

		a.click(); // It seems no need to mount to document.
	}

	return <Button {...others} onClick={download}>{children}</Button>;
}
