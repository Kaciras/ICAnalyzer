// noinspection JSUnusedGlobalSymbols
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Window {
	__isSupport__: boolean;
}

/*
 * Check if the browser can run this app, alert if it cannot. see README.MD for supported browsers.
 *
 * Since SyntaxError thrown while the code is being parsed,
 * to catch it the test code should be wrapped with eval() and the script block
 * must run before parsing any invalid code.
 *
 * This file is an entry point and will be injected to HTML before the index chunk.
 */

try {
	// noinspection JSUnusedLocalSymbols
	eval("const x = null ?? 0");

	window.__isSupport__ = true;
} catch {
	window.__isSupport__ = false;
	alert("ICAnalyzer doesn't support this browser, please use a modern one.");
}
