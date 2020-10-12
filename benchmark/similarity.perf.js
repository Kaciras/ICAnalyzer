const { performance } = require("perf_hooks");
const { getPSNR } = require("../lib/similarity.js");
const { readImage } = require("../test/test-helper.js");
const { GPU } = require("gpu.js");

async function jsGetPSNR(twoImages) {
	const { dataA, dataB } = twoImages;
	const { length } = dataA;

	let sum = 0;
	for (let i = 0; i < length; i++) {
		const e = dataA[i] - dataB[i];
		sum += e * e;
	}
	return 10 * Math.log10(255 * 255 / sum * length);
}

function sseGPU(dataA, dataB) {
	const i = this.thread.x;
	const e = dataA[i] - dataB[i];
	return e * e;
}

const gpu = new GPU();
let kernel;

function gpuGetPSNR(twoImages) {
	const { dataA, dataB } = twoImages;
	const { length } = dataA;

	const out = kernel(dataA, dataB);

	const x = out.reduce((s, v) => s + v, 0);
	return 10 * Math.log10(255 * 255 / x * length);
}

async function benchmark(name, func) {
	for (let i = 0; i < 100; i++) {
		await func();
	}

	const start = performance.now();
	for (let i = 0; i < 100; i++) {
		await func();
	}
	const time = performance.now() - start;

	console.log(`${name}: ${time.toFixed(3)}ms`);
}


async function run() {
	const { data, info } = await readImage("image.jpg", 4);
	const dataB = (await readImage("image.webp", 4)).data;
	const { width, height } = info;

	const images = {
		dataA: data,
		dataB,
		width,
		height,
	};

	kernel = gpu.createKernel(sseGPU).setOutput([data.length]);

	await benchmark("js", () => jsGetPSNR(images));
	await benchmark("wasm", () => getPSNR(images));
	await benchmark("gpu", () => gpuGetPSNR(images));
}

run().catch(e => console.error(e));
