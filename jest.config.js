module.exports = {
	testMatch: [
		"**/test/*.spec.[jt]s?(x)",
	],
	moduleFileExtensions: [
		"ts", "tsx", "mjs", "js",
	],
	preset: "ts-jest",
	clearMocks: true,
	coverageDirectory: "coverage",
	coverageProvider: "v8",
};
