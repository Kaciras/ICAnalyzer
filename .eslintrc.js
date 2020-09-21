module.exports = {
	env: {
		node: true,
		es2021: true
	},
	extends: [
		"eslint:recommended",
	],
	parserOptions: {
		ecmaVersion: 12,
		sourceType: "module"
	},
	plugins: [
		"@typescript-eslint"
	],
	rules: {
		"quotes": ["error", "double", { avoidEscape: true }],
		"indent": ["error", "tab"],
		"linebreak-style": ["error", "unix"],
		"semi": ["error", "always"],
	},
	overrides: [
		{
			files: ["web/*.{j,t}s?(x)",],
			env: {
				node: false,
				browser: true,
			},
		},
		{
			files: ["*.ts?(x)"],
			parser: "@typescript-eslint/parser",
			extends: [
				"plugin:@typescript-eslint/recommended",
			],
			rules: {
				"@typescript-eslint/explicit-module-boundary-types": ["off"],
			},
		},
	],
};
