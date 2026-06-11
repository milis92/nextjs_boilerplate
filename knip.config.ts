import type { KnipConfig } from "knip"

const config: KnipConfig = {
  ignore: [
    ".claude/**",
    "src/components/ui/**",
    "src/lib/auth/client.ts",
    "src/lib/rest/client.ts",
    "src/i18n/i18n.ts",
    "src/i18n/i18n-navigation.ts",
    "codegen.graphql.ts",
  ],
  ignoreDependencies: [
    // CLI invoked directly (configured via portless.json), not imported anywhere
    "portless",
    // Render helper for the vitest browser ("ui") project — only imported by
    // src/**/*.test.tsx files, none of which exist yet in the boilerplate
    "vitest-browser-react",
    "@eslint/eslintrc",
    "openapi-fetch",
    "@graphql-codegen/client-preset",
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
}

export default config
