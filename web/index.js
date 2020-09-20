import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import * as Canvas from "./canvas.js";

document.getElementById("file").oninput = loadFile;

async function loadFile(event) {
	const bitmap = await createImageBitmap(event.target.files[0]);
	const { width, height } = bitmap;

	const canvas = document.getElementById("diff");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	ctx.drawImage(bitmap, 0, 0);
	const canvasData = ctx.getImageData(0, 0, width, height);

	const worker = new Worker("encoder.js");
	const encoder = Comlink.wrap(worker);

	const image = { width, height, buffer: canvasData.data.buffer, channels: 4 };
	await encoder.initialize(Comlink.transfer(image, [canvasData.data.buffer]));
	const webp = await encoder.encode({ use_sharp_yuv: 1 });

	const blob = new Blob([webp], { type: 'image/webp' });

	const canvasP = document.getElementById("preview");
	canvasP.width = width;
	canvasP.height = height;
	const ctxP = canvasP.getContext("2d");
	ctxP.drawImage(await createImageBitmap(blob), 0, 0);

	console.info(`Origin: ${event.target.files[0].size}`);
	console.info(`WebP: ${webp.byteLength}`);
	console.info(`Compress ratio: ${webp.byteLength / event.target.files[0].size * 100}%`);
}

function loadImageData(url) {
	const img = document.createElement("img");
	img.src = url;
	return new Promise((resolve, reject) => {
		img.onerror = reject;
		img.onload = () => resolve(img);
	});
}

async function loadDiffs(name, type, count) {
	const diffs = [];
	for (let i = 0; i < count; i++) {
		diffs.push(await loadImageData(`../data/${name}/${type}/${i}.png`));
	}
	return diffs;
}

async function load(name) {
	const parent = document.getElementById("blend");
	parent.style = `background-image: url("../data/${name}/image.png")`;

	const diffs = await loadDiffs(name, "Quality", 80);

	// await drawChart(name);

	function show(image, i) {
		Canvas.show(image);
		document.getElementById("diff").src = `../data/${name}/Quality/${i}.png`;
	}

	document.getElementById("range").oninput = (event) => {
		show(diffs[event.target.valueAsNumber], event.target.valueAsNumber);
	};

	document.getElementById("range").value = 0;
	show(diffs[0], 0);
}

// load("6f6a94d94f9eb1a25faaa68ea3f8565ad09a80b4458bcdbb6bea9ed95f5a3df0");