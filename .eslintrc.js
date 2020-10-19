module.exports = {
	env: {
		node: true,
		es2021: true,
	},
	extends: [
		"eslint:recommended",
	],
	parserOptions: {
		ecmaVersion: 12,
		sourceType: "module",
	},
	plugins: [
		"@typescript-eslint",
		"react",
		"react-hooks",
	],
	settings: {
		react: {
			version: "detect",
		},
	},
	rules: {
		"quotes": ["error", "double", { avoidEscape: true }],
		"indent": ["error", "tab", { SwitchCase: 1 }],
		"linebreak-style": ["error", "unix"],
		"semi": ["error", "always"],
		"comma-dangle": ["error", "always-multiline"],
	},
	overrides: [
		{
			files: ["*.{j,t}sx"],
			env: {
				browser: true,
				node: false,
			},
			extends: [
				"plugin:react/recommended",
			],
			rules: {
				"react-hooks/rules-of-hooks": "error",
			},
		},
		{
			files: ["*.ts?(x)"],
			parser: "@typescript-eslint/parser",
			extends: [
				"plugin:@typescript-eslint/recommended",
			],
			rules: {
				"@typescript-eslint/no-non-null-assertion": ["off"],
				"@typescript-eslint/no-explicit-any": ["off"],
				"@typescript-eslint/explicit-module-boundary-types": ["off"],
				"@typescript-eslint/ban-ts-comment": ["off"],
				"@typescript-eslint/no-empty-function": ["off"],
			},
		},
		{
			files: ["**/test/*.spec.{j,t}s"],
			env: {
				jest: true,
			},
			extends: [
				"plugin:jest/style",
				"plugin:jest/recommended",
			],
		},
	],
};
