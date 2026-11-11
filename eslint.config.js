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
    files: [
      "src/components/ui/carousel.tsx",
      "src/components/ui/video-player.tsx",
    ],
    // Vendored HextaUI components: their design tokens (CSS custom properties,
    // snap/dot math, container queries) are arbitrary values by design and
    // mirror upstream source.
    rules: {
      "shadcn/no-arbitrary-values": "off",
      // Mirror upstream HextaUI source: its defensive checks and styles trip
      // these rules, and diverging from upstream would complicate updates.
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/prefer-for-of": "off",
      "shadcn/no-restyle": "off",
    },
  },
  {
    ignores: [
      "eslint.config.js",
      ".prettierrc",
      ".output",
      "dist",
      "node_modules",
      "src/routeTree.gen.ts",
      "src/gql/**",
    ],
  },
]
