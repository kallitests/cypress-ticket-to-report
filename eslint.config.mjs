import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import pluginCypress from "eslint-plugin-cypress";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  globalIgnores([
    "node_modules/**",
    "vendor/**",
    "reports/**",
    "cypress/videos/**",
    "cypress/screenshots/**",
    "cypress/downloads/**",
  ]),
  ...tseslint.configs.recommended,
  {
    files: ["cypress/**/*.ts", "cypress.config.ts"],
    extends: [pluginCypress.configs.recommended],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  eslintConfigPrettier,
]);
