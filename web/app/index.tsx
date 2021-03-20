import { useState } from "react";
import CompressSession, { EncoderNameToOptions } from "./CompressSession";
import IntroPage from "./IntroPage";
import AnalyzePage from "./AnalyzePage";
import { AnalyzeConfig } from "./ConfigDialog";

export interface InputImage {
	file: File;
	data: ImageData;
}

export interface Result {
	original: InputImage;
	config: AnalyzeConfig;
	map: EncoderNameToOptions;
}

interface ResultWithId extends Result {
	id: number;
}

export default function App() {
	const [isOpen, setOpen] = useState(false);
	const [result, setResult] = useState<ResultWithId>();

	function handleChange(value: Result) {
		setOpen(false);
		(value as ResultWithId).id = (result?.id || 1) + 1;
		setResult(value as ResultWithId);
	}

	const showDialog = () => setOpen(true);

	return (
		<>
			{result
				? <AnalyzePage
					key={result.id} // force
					result={result}
					onStart={showDialog}
					onClose={() => setResult(undefined)}
				/>
				: <IntroPage onStart={showDialog}/>
			}
			<CompressSession
				open={isOpen}
				onChange={handleChange}
				onClose={() => setOpen(false)}
			/>
		</>
	);
}