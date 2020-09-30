module.exports = {
	testMatch: [
		"**/test/*.spec.[jt]s",
	],
	preset: "ts-jest",
	testEnvironment: "node",
	clearMocks: true,
	coverageDirectory: "coverage",
	coverageProvider: "v8",
};
