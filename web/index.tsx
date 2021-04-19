import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import packageJson from "../package.json";
import "./index.scss";
import App from "./app";

function detectBrowserSupport() {
	try {
		new File([], "");
	} catch {
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

if (typeof process.env.SENTRY_DSN !== "undefined") {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		integrations: [
			new Integrations.BrowserTracing(),
		],
		tracesSampleRate: 0.2,
		release: `${packageJson.name}@${packageJson.version}`,
	});
}

ReactDOM.render(<App/>, document.getElementById("root"));
