// noinspection JSUnusedGlobalSymbols
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Window {
	__isSupport__: boolean;
}

/*
 * Check if the browser can run this app, alert if it cannot. see README.MD for supported browsers.
 *
 * This file is an entry point and will be injected to HTML before the index chunk.
 */
window.__isSupport__ = CSS.supports("selector(&)") && CSS.supports("selector(:has(*))");

if (!window.__isSupport__) {
	alert("ICAnalyzer doesn't support this browser, please use a modern one.");
}
