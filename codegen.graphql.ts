import type { CodegenConfig } from "@graphql-codegen/cli"
import { config as loadEnv } from "@dotenvx/dotenvx"

// graphql-codegen does not load Next's env files — load them the way `next dev` would.
loadEnv({
  path: [".env.local", ".env"],
  ignore: ["MISSING_ENV_FILE"],
  quiet: true,
})

const schemaUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL
if (!schemaUrl) {
  throw new Error(
    "NEXT_PUBLIC_GRAPHQL_URL is not set. Copy .env.example to .env.local first."
  )
}

const config: CodegenConfig = {
  overwrite: true,
  schema: schemaUrl,
  documents: [
    "src/app/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "src/lib/**/*.{ts,tsx}",
  ],
  ignoreNoDocuments: true,
  generates: {
    "./src/lib/graphql/generated/": {
      preset: "client",
      config: {
        useTypeImports: true,
      },
    },
  },
}

export default config
