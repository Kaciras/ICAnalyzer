import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./app/App";

function detectBrowserSupport() {
	try {
		new File([], "");
	} catch (_) {
		return false;
	}
	if (!CSS.supports("mix-blend-mode: difference")) {
		return false;
	}
	return "AbortController" in window;
}

if (!detectBrowserSupport()) {
	alert("ICAnalyze does not support this browser, please switch to a modern one");
}

ReactDOM.render(<App/>, document.getElementById("root"));
