import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
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

if (process.env.NODE_ENV === "production") {
	Sentry.init({
		integrations: [
			new Integrations.BrowserTracing(),
		],
		tracesSampleRate: 0.2,
		release: `${process.env.npm_package_name}@${process.env.npm_package_version}`,
		dsn: "https://d101904fac2c486ea6f8563c2cf054af@o253601.ingest.sentry.io/5499968",
	});
}

ReactDOM.render(<App/>, document.getElementById("root"));
