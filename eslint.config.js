//  @ts-check
import { plugin as shadcn } from "@shadcn/lint"
import tsParser from "@typescript-eslint/parser"
import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      shadcn,
    },
    rules: {
      "shadcn/no-arbitrary-values": "error",
      "shadcn/no-restyle": ["error", { allow: ["layout"] }],
    },
  },
  {
    ignores: [
      "eslint.config.js",
      ".prettierrc",
      ".output",
      "dist",
      "node_modules",
    ],
  },
]
