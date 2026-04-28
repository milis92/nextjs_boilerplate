import type { KnipConfig } from "knip"

const config: KnipConfig = {
  ignore: [
    "src/components/ui/**",
    "src/lib/auth.client.ts",
    "src/lib/rest.client.ts",
    "src/i18n/i18n.ts",
    "src/i18n/i18n-navigation.ts",
    "codegen.graphql.ts",
  ],
  ignoreDependencies: [
    "@eslint/eslintrc",
    "vitest-browser-react",
    "better-auth",
    "openapi-fetch",
    "lucide-react",
    "@graphql-codegen/client-preset",
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
}

export default config
