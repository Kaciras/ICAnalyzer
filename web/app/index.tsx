import { useState } from "react";
import CompressSession, { OutputMap } from "./CompressSession";
import IntroPage from "./IntroPage";
import AnalyzePage from "./AnalyzePage";
import CompareSession from "./CompareSession";
import { ControlType } from "../form";
import { MetricMeta } from "./ChartPanel";

export interface InputImage {
	file: File;
	raw: ImageData;
}

export type ControlsMap = Record<string, ControlType[]>;

export interface Result {
	input: InputImage;
	controlsMap: ControlsMap;
	outputMap: OutputMap;
	seriesMeta: MetricMeta[];
}

interface ResultWithId extends Result {
	id: number;
}

enum Mode {
	None,
	Compress,
	Compare,
}

export default function App() {
	const [mode, setMode] = useState(Mode.None);
	const [isOpen, setOpen] = useState(true);
	const [result, setResult] = useState<ResultWithId>();

	function handleChange(value: Result) {
		setOpen(false);
		(value as ResultWithId).id = (result?.id || 1) + 1;
		setResult(value as ResultWithId);
	}

	function createSession(mode: Mode) {
		setMode(mode);
		setOpen(true);
	}

	let Session: any;
	switch (mode) {
		case Mode.Compare:
			Session = CompareSession;
			break;
		case Mode.Compress:
			Session = CompressSession;
			break;
	}

	return (
		<>
			{result
				? <AnalyzePage
					key={result.id} // avoid reuse of control state
					result={result}
					onStart={() => setOpen(true)}
					onClose={() => setResult(undefined)}
				/>
				: <IntroPage
					onEncode={() => createSession(Mode.Compress)}
					onCompare={() => createSession(Mode.Compare)}
				/>
			}
			{
				Session && <Session
					isOpen={isOpen}
					onChange={handleChange}
					onClose={() => setOpen(false)}
				/>
			}
		</>
	);
}
