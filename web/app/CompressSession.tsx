import { Dispatch, useState } from "react";
import { decode } from "../decode";
import { BatchEncodeAnalyzer, ConvertOutput } from "../encode";
import { Result } from "./App";
import SelectFileDialog from "./SelectFileDialog";
import ConfigDialog, { AnalyzeConfig } from "./ConfigDialog";
import ProgressDialog from "./ProgressDialog";
import { ENCODERS, ImageEncoder } from "../codecs";

interface Props {
	open: boolean;
	onChange: Dispatch<Result>;
	onClose: () => void;
}

type OptKey = string | number;

export type OptionsToResult = Map<OptKey, ConvertOutput>;
export type EncoderNameToOptions = Map<string, OptionsToResult>;
export type ImageToEncoderNames = Map<ImageData, EncoderNameToOptions>;
export type PreprocessToImage = Map<OptKey, ImageToEncoderNames>;

export default function CompressSession(props: Props) {
	const [file, setFile] = useState<File>();
	const [image, setImage] = useState<ImageData>();
	const [selectFile, setSelectFile] = useState(true);

	const [encoder, setEncoder] = useState<BatchEncodeAnalyzer | null>(null);
	const [max, setMax] = useState(1);
	const [progress, setProgress] = useState(0);

	function cancelSelectFile() {
		if (file) {
			setSelectFile(false);
		} else {
			props.onClose();
		}
	}

	async function handleFileChange(newFile: File) {
		const image = await decode(newFile);
		setFile(newFile);
		setImage(image);
		setSelectFile(false);
	}

	async function handleStart(config: AnalyzeConfig) {
		if (!file) {
			throw new Error("File is null");
		}
		const { preprocess, encode, threads, measure } = config;
		const images = [await decode(file)];

		for (const [name, options] of Object.entries(preprocess)) {
			// TODO
		}

		const encoders = ENCODERS.map(enc => enc.name).filter(name => name in encode);

		let outputSizePerImage = 0;
		const queue: [ImageEncoder, any[]][] = [];

		for (const enc of ENCODERS) {
			const { name, getOptionsList } = enc;
			const state = encode[name];
			if (!state) {
				continue;
			}
			const optList = getOptionsList(state);
			queue.push([enc, optList]);
			outputSizePerImage += optList.length;
		}

		setMax(images.length * outputSizePerImage);
		setProgress(0);

		const iMap: ImageToEncoderNames = new Map();

		for (const image of images) {
			const eMap: EncoderNameToOptions = new Map();
			iMap.set(image, eMap);

			for (const [encoder, optionsList] of queue) {
				const oMap: OptionsToResult = new Map();
				eMap.set(encoder.name, oMap);

				const worker = new BatchEncodeAnalyzer(image, {
					encoder,
					threads,
					optionsList,
					measure,
				});

				setEncoder(worker);
				const outputs = await worker.encode();
				worker.terminate();
				setEncoder(null);

				for (let i = 0; i < optionsList.length; i++) {
					const k = JSON.stringify(optionsList[i]);
					oMap.set(k, outputs[i]);
				}
			}
		}
		// encoder.onProgress = setProgress;

		props.onChange({
			state: encode,
			map: iMap,
			original: { file, data: image! },
		});
	}

	function stop() {
		encoder!.terminate();
		setEncoder(null);
	}

	if (!props.open) {
		return null;
	} else if (encoder) {
		return <ProgressDialog value={progress} max={max} onCancel={stop}/>;
	} else if (selectFile) {
		return <SelectFileDialog onCancel={cancelSelectFile} onFileChange={handleFileChange}/>;
	} else {
		return <ConfigDialog
			image={image!}
			file={file!}
			onSelectFile={() => setSelectFile(true)}
			onClose={props.onClose}
			onStart={handleStart}
		/>;
	}
}
