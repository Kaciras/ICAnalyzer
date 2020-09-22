import { encodeWebP } from "./encoding";

document.getElementById("file").oninput = loadFile;

const canvasP = document.getElementById("preview");
const canvasD = document.getElementById("diff");
const ctxP = canvasP.getContext("2d");
const ctxD = canvasD.getContext("2d");

async function loadFile(event) {
	const file = event.target.files[0];
	const bitmap = await createImageBitmap(file);
	const { width, height } = bitmap;

	canvasP.width = width;
	canvasP.height = height;
	canvasD.width = width;
	canvasD.height = height;

	ctxP.drawImage(bitmap, 0, 0);
	const canvasData = ctxP.getImageData(0, 0, width, height);

	const optionsList = new Array(101);
	for (let i = 1; i < 100; i++) {
		optionsList[i] = { quality: i };
	}
	return load(file, await encodeWebP(canvasData, optionsList));

	// console.info(`Origin: ${file.size}`);
	// console.info(`WebP: ${webp.byteLength}`);
	// console.info(`Compress ratio: ${webp.byteLength / event.target.files[0].size * 100}%`);
}

async function load(file, encodedFiles) {
	const rawUrl = URL.createObjectURL(file);
	const parent = document.getElementById("blend");
	parent.style = `background-image: url("${rawUrl}")`;

	function show(i) {
		ctxP.drawImage(encodedFiles[i], 0, 0);
		ctxD.drawImage(encodedFiles[i], 0, 0);
	}

	show(75);

	document.getElementById("range").oninput = (event) => {
		show(event.target.valueAsNumber);
	};

	document.getElementById("range").value = 75;
}
