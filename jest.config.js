module.exports = {
	testMatch: [
		"**/test/*.spec.[jt]s?(x)",
	],
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
