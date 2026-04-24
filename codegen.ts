import type { CodegenConfig } from "@graphql-codegen/cli"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

const config: CodegenConfig = {
  overwrite: true,
  schema: `${apiUrl}/graphql`,
  documents: [
    "src/app/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "src/lib/**/*.{ts,tsx}",
  ],
  ignoreNoDocuments: true,
  generates: {
    "./src/lib/gql/": {
      preset: "client",
      config: {
        useTypeImports: true,
      },
    },
  },
}

export default config
