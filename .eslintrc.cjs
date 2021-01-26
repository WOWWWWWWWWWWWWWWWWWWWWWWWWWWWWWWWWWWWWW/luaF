module.exports = {
	env: {
		es2021: true,
		node: true
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier"
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 12,
		sourceType: "module"
	},
	plugins: ["@typescript-eslint"],
	ignorePatterns: ["dist/**/*", "import-expand/**/*"],
	rules: {
		"linebreak-style": ["error", "windows"],
		quotes: ["error", "double", { avoidEscape: true }],
		semi: ["error", "never"],
		"no-constant-condition": "off"
	}
}
