const imageEl = document.getElementById("preview");
const diffEl = document.getElementById("diff");

const ctxImage = imageEl.getContext("2d");
const ctxDiff = diffEl.getContext("2d");

let difference;
let zoomRatio = 1;

export function reset() {

}

export function show(diff) {
	if (!difference) {
		requestAnimationFrame(animationLoop);
	}
	difference = diff;
}

function zoomHandler(event) {
	zoomRatio += event.deltaY;
}

imageEl.addEventListener("wheel", zoomHandler);
diffEl.addEventListener("wheel", zoomHandler);

function animationLoop() {
	ctxImage.drawImage(difference, 0, 0, 600, 400);
	ctxDiff.drawImage(difference, 0, 0, 600, 400);

	requestAnimationFrame(animationLoop);
}
