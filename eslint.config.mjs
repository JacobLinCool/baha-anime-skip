import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": [
                "error",
                { allowArgumentsExplicitlyTypedAsAny: true },
            ],
        },
    },
    {
        ignores: ["**/lib/**", "**/dist/**", "**/docs/**"],
    },
];
