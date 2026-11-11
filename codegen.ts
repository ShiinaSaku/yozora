import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  ignoreNoDocuments: true,
  generates: {
    "./src/gql/": {
      schema: "https://graphql.anilist.co",
      documents: ["src/lib/anilist/**/*.{ts,tsx,graphql}"],
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: "string",
        useTypeImports: true,
      },
    },
    "./src/gql/themes/": {
      // AnimeThemes blocks non-browser fetchers on its live endpoint; refresh
      // the schema snapshot with the curl command in README (User-Agent required).
      schema: "schemas/animethemes-introspection.json",
      documents: ["src/lib/themes/operations.ts"],
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
      schema: "https://graphql.anilist.co",
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
}

export default config
