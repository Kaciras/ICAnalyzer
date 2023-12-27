export default {
	testMatch: [
		"**/test/*.spec.[jt]s?(x)",
	],
	extensionsToTreatAsEsm: [".ts"],
	moduleFileExtensions: [
		"ts", "tsx", "mjs", "js",
	],
	transform: {
		"^.+\\.ts$": ["@swc/jest"],
	},
	clearMocks: true,
	coverageProvider: "v8",
	coverageDirectory: "coverage",
};
