import type { KnipConfig } from "knip"

const config: KnipConfig = {
  // Files to exclude from Knip analysis
  ignore: [
    "src/components/ui/**", // shadcn-generated, manage via shadcn CLI
    "src/lib/auth-client.ts",
    "src/lib/i18n.ts",
    "src/lib/i18n-actions.ts",
    "src/types/i18n.ts",
    "src/utils/app-config.ts",
  ],
  // Dependencies to ignore during analysis
  ignoreDependencies: [
    "@eslint/eslintrc", // Flat-config shim used by eslint.config.mjs
    "vitest-browser-react", // Used by future component tests (no test yet)
    "better-auth", // Used by lib/auth-client.ts (ignored file)
    "lucide-react",
    "openapi-typescript", // OpenAPI codegen CLI, invoked by codegen:rest script (Task 4)
    "tsx", // Script runner for codegen.rest.ts, wired up in codegen:rest script (Task 4)
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
}

export default config
