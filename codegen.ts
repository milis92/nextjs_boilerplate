import type { CodegenConfig } from "@graphql-codegen/cli"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

const config: CodegenConfig = {
  overwrite: true,
  schema: `${apiUrl}/graphql`,
  documents: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
  ],
  ignoreNoDocuments: true,
  generates: {
    "./lib/gql/": {
      preset: "client",
      config: {
        useTypeImports: true,
      },
    },
  },
}

export default config
