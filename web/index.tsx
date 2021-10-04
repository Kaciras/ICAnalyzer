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

const isSupported = detectBrowserSupport();
if (!isSupported) {
	alert("ICAnalyzer does not support this browser, please switch to a modern one");
}

// Can't use { name, version } = packageJson, because webpack doesn't support tree shaking for object destructuring.
// SENTRY_DSN is only defined on web build.
if (isSupported && process.env.SENTRY_DSN !== null) {
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
