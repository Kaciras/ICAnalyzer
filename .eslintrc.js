module.exports = {
	root: true,
	env: {
		es2021: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
	],
	parserOptions: {
		sourceType: "module",
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	rules: {
		"quotes": ["error", "double", { avoidEscape: true }],
		"indent": ["error", "tab", { SwitchCase: 1 }],
		"linebreak-style": ["error", "unix"],
		"eqeqeq": "error",
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
				"plugin:react-hooks/recommended",
			],
			rules: {
				// https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#eslint
				"react/jsx-uses-react": "off",
				"react/react-in-jsx-scope": "off",
			},
		},
		{
			files: ["*.ts?(x)"],
			extends: [
				"plugin:@typescript-eslint/recommended",
			],
			rules: {
				"@typescript-eslint/no-non-null-assertion": "off",
				"@typescript-eslint/no-explicit-any": "off",
				"@typescript-eslint/explicit-module-boundary-types": "off",
				"@typescript-eslint/ban-ts-comment": "off",
				"@typescript-eslint/no-empty-function": "off",
			},
		},
		{
			files: ["**/test/*.spec.{j,t}s"],
			extends: [
				"plugin:jest/style",
				"plugin:jest/recommended",
			],
		},
	],
};
