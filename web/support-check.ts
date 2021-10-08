// noinspection JSUnusedGlobalSymbols
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Window {
	__isSupport__: boolean;
}

/*
 * SyntaxError thrown thrown while the code is being parsed,
 * to catch it the code must be wrapped by eval() and the script block
 * must be run before parsing the invalid code.
 */

try {
	// noinspection JSUnusedLocalSymbols
	eval("class _ { i }");
	eval("let x = 0; x ??= 1");

	window.__isSupport__ = true;
} catch {
	window.__isSupport__ = false;
}

if (!window.__isSupport__) {
	alert("ICAnalyzer does not support this browser, please use a modern one.");
}
