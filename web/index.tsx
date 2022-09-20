import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import packageJson from "../package.json";
import "./index.scss";
import App from "./app";

// SENTRY_DSN is only defined on the CI.
if (window.__isSupport__ && process.env.SENTRY_DSN !== null) {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		integrations: [
			new Integrations.BrowserTracing(),
		],
		tracesSampleRate: 0.2,
		release: `${packageJson.name}@${packageJson.version}`,
	});
}

createRoot(document.getElementById("root")!).render(<App/>);
