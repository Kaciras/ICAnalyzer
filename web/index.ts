import { createAVIFEncoder, createWebPEncoder } from "./encoding";
import { drawChart } from "./chart";
import { WebPEncodeOptions } from "./worker/webp-encoder";
import { Options, Subsample } from "./worker/avif-encoder";
import { isSupportAVIF } from "./utils";

const fileInput = document.getElementById("file") as HTMLInputElement;
fileInput.oninput = loadFile;

const rangeInput = document.getElementById("range") as HTMLInputElement;

const canvasP = document.getElementById("preview") as HTMLCanvasElement;
const canvasD = document.getElementById("diff") as HTMLCanvasElement;
const ctxP = canvasP.getContext("2d")!;
const ctxD = canvasD.getContext("2d")!;

async function loadFile() {
	const file = fileInput.files![0];
	const bitmap = await createImageBitmap(file);
	const { width, height } = bitmap;

	canvasP.width = width;
	canvasP.height = height;
	canvasD.width = width;
	canvasD.height = height;

	ctxP.drawImage(bitmap, 0, 0);
	const canvasData = ctxP.getImageData(0, 0, width, height);

	if (!(await isSupportAVIF())) {
		return alert("Your browser does not support avif image.");
	}
	return showResult(file, await encodeAvif(canvasData));

	// console.info(`Origin: ${file.size}`);
	// console.info(`WebP: ${webp.byteLength}`);
	// console.info(`Compress ratio: ${webp.byteLength / event.target.files[0].size * 100}%`);
}

function encode(image: ImageData) {
	const optionsList = new Array<WebPEncodeOptions>(101);
	for (let i = 0; i < 101; i++) {
		optionsList[i] = { quality: i };
	}

	const progress = document.getElementById("progress") as HTMLProgressElement;
	progress.value = 0;
	progress.max = optionsList.length;

	const encoder = createWebPEncoder();
	encoder.onProgress = value => progress.value = value;

	return encoder.encode(image, optionsList).start();
}

function encodeAvif(image: ImageData) {
	const optionsList = new Array<Options>();

	for (let i = 0; i < 32; i++) {
		optionsList[i] = {
			minQuantizer: i * 2,
			maxQuantizer: 63,
			minQuantizerAlpha: i * 2,
			maxQuantizerAlpha: 63,
			tileColsLog2: 0,
			tileRowsLog2: 0,
			speed: 8,
			subsample: Subsample.YUV444, // 4:4:4 无转换损失
		};
	}

	rangeInput.max = "31";

	const progress = document.getElementById("progress") as HTMLProgressElement;
	progress.value = 0;
	progress.max = optionsList.length;

	const encoder = createAVIFEncoder();
	encoder.onProgress = value => progress.value = value;

	return encoder.encode(image, optionsList).start();
}

async function showResult(file: File, encodedFiles: ArrayBuffer[]) {
	const rawUrl = URL.createObjectURL(file);
	const parent = document.getElementById("blend")!;
	parent.style.backgroundImage = `url("${rawUrl}")`;

	const brightnessInput = document.getElementById("brightness") as HTMLInputElement;
	brightnessInput.oninput = () => parent.style.setProperty("--brightness", brightnessInput.value + "%");

	const label = document.getElementById("range-label") as HTMLLabelElement;

	const bitmaps: ImageBitmap[] = [];
	for (const data of encodedFiles) {
		const blob = new Blob([data], { type: "image/avif" });
		bitmaps.push(await createImageBitmap(blob));
	}

	const chart = drawChart({
		title: {
			text: "Quality (-q)"
		},
		tooltip: {
			trigger: "axis",
		},
		legend: {
			data: ["Compression Ratio"]
		},
		xAxis: {
			data: encodedFiles.map((_, i) => i)
		},
		yAxis: {},
		series: [{
			name: "Compression Ratio %",
			type: "line",
			data: encodedFiles.map(({ byteLength }) => byteLength / file.size * 100),
		}],
	});

	function show(i: number) {
		label.textContent = `Quality (-q) = ${i}`;
		ctxP.drawImage(bitmaps[i], 0, 0);
		ctxD.drawImage(bitmaps[i], 0, 0);
		// chart.dispatchAction({ type: "showTip", x: i, y: 0,position: ["50%", "50%"] });
	}

	rangeInput.valueAsNumber = 75;
	rangeInput.oninput = () => show(rangeInput.valueAsNumber);

	show(parseInt(rangeInput.max));
}
