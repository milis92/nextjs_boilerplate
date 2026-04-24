import type { KnipConfig } from "knip"

const config: KnipConfig = {
  // Files to exclude from Knip analysis
  ignore: [
    "components/ui/**", // shadcn-generated, manage via shadcn CLI
    "lib/auth-client.ts",
    "lib/i18n.ts",
    "lib/i18n-actions.ts",
    "types/i18n.ts",
    "utils/app-config.ts",
  ],
  // Dependencies to ignore during analysis
  ignoreDependencies: [
    "@eslint/eslintrc", // Flat-config shim used by eslint.config.mjs
    "vitest-browser-react", // Used by future component tests (no test yet)
    "better-auth", // Used by lib/auth-client.ts (ignored file)
    "lucide-react",
    "openapi-fetch", // Typed REST client, used by future API integration
    "openapi-typescript", // OpenAPI codegen, used by future API generation
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
}

export default config
