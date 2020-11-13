import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
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

Sentry.init({
	dsn: "https://d101904fac2c486ea6f8563c2cf054af@o253601.ingest.sentry.io/5499968",
	integrations: [
		new Integrations.BrowserTracing(),
	],
	tracesSampleRate: 1.0,
});

ReactDOM.render(<App/>, document.getElementById("root"));
