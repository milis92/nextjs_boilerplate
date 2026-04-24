import type { KnipConfig } from "knip"

const config: KnipConfig = {
  ignore: [
    "src/components/ui/**",
    "src/lib/auth.client.ts",
    "src/lib/rest.client.ts",
    "src/lib/i18n.ts",
    "src/lib/i18n-actions.ts",
    "src/types/i18n.ts",
    "src/utils/app-config.ts",
    "src/i18n/I18n.ts",
    "src/i18n/I18nNavigation.ts",
  ],
  ignoreDependencies: [
    "@eslint/eslintrc",
    "vitest-browser-react",
    "better-auth",
    "openapi-fetch",
    "lucide-react",
    "openapi-typescript",
    "tsx",
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
}

export default config
