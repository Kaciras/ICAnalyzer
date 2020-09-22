import { encodeWebP } from "./encoding";
import { WebPEncodeOptions } from "./worker/webp-encoder";

const fileInput = document.getElementById("file") as HTMLInputElement;
fileInput.oninput = loadFile;

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

	const optionsList = new Array<WebPEncodeOptions>(101);
	for (let i = 1; i < 100; i++) {
		optionsList[i] = { quality: i };
	}
	return load(file, await encodeWebP(canvasData, optionsList));

	// console.info(`Origin: ${file.size}`);
	// console.info(`WebP: ${webp.byteLength}`);
	// console.info(`Compress ratio: ${webp.byteLength / event.target.files[0].size * 100}%`);
}

async function load(file: File, encodedFiles: ImageBitmap[]) {
	const rawUrl = URL.createObjectURL(file);
	const parent = document.getElementById("blend")!;
	parent.style.backgroundImage = `url("${rawUrl}")`;

	const rangeInput = document.getElementById("range") as HTMLInputElement;
	const label = document.getElementById("range-label") as HTMLLabelElement;

	function show(i: number) {
		label.textContent = `Quality (-q) = ${i}`;
		ctxP.drawImage(encodedFiles[i], 0, 0);
		ctxD.drawImage(encodedFiles[i], 0, 0);
	}

	show(75);

	rangeInput.valueAsNumber = 75;
	rangeInput.oninput = () => show(rangeInput.valueAsNumber);
}
