import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("eslint:recommended"), {
    plugins: {
        jsdoc,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        curly: [1, "all"],
        semi: [1, "always"],
    },
}, {
    files: ["tests/*.js"],

    languageOptions: {
        globals: {
            ...globals.jest,
        },
    },
}];