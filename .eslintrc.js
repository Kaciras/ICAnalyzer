const jestConfig = require("./jest.config");

module.exports = {
	root: true,
	extends: [
		"@kaciras/core",
		"@kaciras/typescript",
		"@kaciras/react",
	],
	env: {
		node: true,
	},
	rules: {
		"react-hooks/exhaustive-deps": "off",
		"react/jsx-curly-brace-presence": ["error", {
			props: "never",
			children: "never",
		}],
	},
	overrides: [{
		files: jestConfig.testMatch,
		extends: ["@kaciras/jest"],
	}],
};
