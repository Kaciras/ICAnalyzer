import core from "@kaciras/eslint-config-core";
import typescript from "@kaciras/eslint-config-typescript";
import react from "@kaciras/eslint-config-react";

export default [
	{ ignores: ["deps/**", "dist/**", "lib/**/*.js"] },
	...core,
	...typescript,
	...react,
	{
		rules: {
			"react-hooks/exhaustive-deps": "off",
		},
	},
];
