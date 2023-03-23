
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
		files: "**/test/*.spec.[jt]s?(x)",
		extends: ["@kaciras/jest"],
	}],
};
