import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Enforce the type-discipline rules from .claude/rules/code-style.md so they
  // bind humans, not just agents.
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": true,
          "ts-ignore": true,
          "ts-nocheck": true,
        },
      ],
      // Bans `as X` / `<X>expr` but allows `as const`. The code-style exception
      // (externally-verified API data) is expressed as an inline
      // eslint-disable with a justification comment.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'TSAsExpression:not([typeAnnotation.typeName.name="const"])',
          message:
            "Type assertions are banned (code-style.md). For externally-verified data, add an inline eslint-disable with a justification.",
        },
        {
          selector: "TSTypeAssertion",
          message: "Type assertions are banned (code-style.md).",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
])

export default eslintConfig
