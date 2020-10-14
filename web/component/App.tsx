import React, { FormEvent, useState } from "react";
import IconButton from "./IconButton";
import CompressDialog from "./CompressDialog";
import Chart from "./Chart";
import style from "./App.scss";
import RangeInput from "./RangeInput";
import ImageView from "./ImageView";

interface Result {
	original: string;
	width: number;
	height: number;

	optimizedImages: ImageBitmap[];
}

const PLACEHOLDER: Result = {
	original: "",
	width: 0,
	height: 0,
	optimizedImages: [],
};

export default function App() {
	const [showDialog, setShowDialog] = useState(false);
	const [index, setIndex] = useState(0);
	const [results, setResults] = useState(PLACEHOLDER);

	async function showResult(file: File, encodedFiles: Uint8Array[]) {
		setShowDialog(false);

		const bitmaps: ImageBitmap[] = [];
		for (const data of encodedFiles) {
			const blob = new Blob([data], { type: "image/webp" });
			bitmaps.push(await createImageBitmap(blob));
		}

		URL.revokeObjectURL(results.original);

		setResults({
			original: URL.createObjectURL(file),
			width: bitmaps[0].width,
			height: bitmaps[0].height,
			optimizedImages: bitmaps,
		});

		setIndex(75);
	}

	function handleIndexChange(e: FormEvent<HTMLInputElement>) {
		const i = e.currentTarget.valueAsNumber;
		setIndex(i);
		// setOptimized(results[i]);
		// canvasRef.current!.getContext("2d")!.drawImage(results[i], 0, 0);
		// chart.dispatchAction({ type: "showTip", x: i, y: 0,position: ["50%", "50%"] });
	}

	return (
		<>
			<section className={style.main}>

				<ImageView {...results} optimized={results.optimizedImages[index]}/>

				<Chart options={results}/>

				<div className={style.buttonGroup}>
					<IconButton
						title="Select file"
						onClick={() => setShowDialog(true)}
						icon={require("bootstrap-icons/icons/cloud-upload.svg")}
					/>
					<IconButton
						title="Show chart"
						disabled={results !== PLACEHOLDER}
						icon={require("bootstrap-icons/icons/bar-chart-line.svg")}
					/>
					<IconButton
						title="Download"
						disabled={results !== PLACEHOLDER}
						onClick={() => setShowDialog(true)}
						icon={require("bootstrap-icons/icons/download.svg")}
					/>
				</div>

				<form className={style.variableGroup}>
					<label>
						<p>Quality (-q) {index}</p>
						<RangeInput
							value={index}
							min={0}
							step={1}
							max={100}
							onChange={handleIndexChange}
						/>
					</label>
				</form>
			</section>

			{showDialog && <CompressDialog onClose={() => setShowDialog(false)} onChange={showResult}/>}
		</>
	);
}
