import type { KnipConfig } from "knip"

const config: KnipConfig = {
  ignore: [
    "src/components/ui/**",
    "src/lib/auth.client.ts",
    "src/lib/rest.client.ts",
    "src/types/I18n.ts",
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
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
}

export default config
