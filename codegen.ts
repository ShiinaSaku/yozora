import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: "https://graphql.anilist.co",
  documents: ["src/lib/anilist/**/*.{ts,tsx,graphql}"],
  ignoreNoDocuments: true,
  generates: {
    "./src/gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: "string",
        useTypeImports: true,
      },
    },
    "./schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
}

export default config
