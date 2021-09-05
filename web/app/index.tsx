import { useState } from "react";
import CompressSession from "./CompressSession";
import IntroPage from "./IntroPage";
import AnalyzePage from "./AnalyzePage";
import CompareSession from "./CompareSession";
import { ControlType } from "../form";
import { AnalyzeResult } from "../image-worker";
import { ObjectKeyMap } from "../utils";

export interface InputImage {
	file: File;
	raw: ImageData;
}

export type ControlsMap = Record<string, ControlType[]>;

export interface MetricMeta {
	key: string;
	name: string;
}

export interface EncodeConfig {
	codec: string;
	key: Record<string, any>;
}

export interface AnalyzeContext {
	input: InputImage;
	controlsMap: ControlsMap;
	outputMap: ObjectKeyMap<EncodeConfig, AnalyzeResult>;
	seriesMeta: MetricMeta[];
}

interface ContextWithId extends AnalyzeContext {
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
	const [result, setResult] = useState<ContextWithId>();

	function handleChange(value: AnalyzeContext) {
		setOpen(false);
		(value as ContextWithId).id = (result?.id || 1) + 1;
		setResult(value as ContextWithId);
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
			{result ?
				<AnalyzePage
					key={result.id} // avoid reuse of control state
					result={result}
					onStart={() => setOpen(true)}
					onClose={() => setResult(undefined)}
				/>
				:
				<IntroPage
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
