const { performance } = require("perf_hooks");
const { initWasmModule, getPSNR } = require("../lib/similarity.js");
const { readImage } = require("../test/test-helper.js");

async function jsGetPSNR(image0, image1) {
	const dataA = image0.data;
	const dataB = image1.data;
	const { length } = dataA;

	let sse = 0;
	for (let i = 0; i < length; i++) {
		const e = dataA[i] - dataB[i];
		sse += e * e;
	}
	return 10 * Math.log10(255 * 255 / sse * length);
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
	const image0 = await readImage("image.jpg");
	const image1 = await readImage("image.webp");
	await initWasmModule();

	await benchmark("js", () => jsGetPSNR(image0, image1));
	await benchmark("wasm", () => getPSNR(image0, image1));
}

run().catch(e => console.error(e));
