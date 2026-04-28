---
name: review-conventions
description: Audit feature code against convention rules, reporting violations with file:line references
---

# review-conventions

Audits existing code against the project's convention rules. Reports every `!IMPORTANT` and `NEVER` violation with `file:line` references.

## Inputs

- `feature` — (optional) feature name or path to audit (e.g. `widgets`, `src/components/WidgetCard.tsx`). If omitted, audits all files in `git diff --name-only HEAD~1`.

## Rule-to-path Mapping

| Rule file | Applies to paths |
|---|---|
| `.claude/rules/architecture.md` | `src/**/*` |
| `.claude/rules/code-style.md` | `src/**/*.ts`, `src/**/*.tsx` |
| `.claude/rules/components.md` | `src/components/**/*` |
| `.claude/rules/data-fetching/rest.md` | `src/**/*.ts`, `src/**/*.tsx` |
| `.claude/rules/data-fetching/graphql.md` | `src/**/*.ts`, `src/**/*.tsx` |
| `.claude/rules/i18n.md` | `src/**/*.tsx` |
| `.claude/rules/auth.md` | `src/**/*.ts`, `src/**/*.tsx` |
| `.claude/rules/testing/unit-testing.md` | `src/**/*.test.ts`, `src/**/*.test.tsx` |
| `.claude/rules/testing/e2e-testing.md` | `tests/**/*.spec.ts` |

## Procedure

1. **Identify files to audit:**
   - If a path/feature is provided: find all source files under that path
   - If not provided: run `git diff --name-only HEAD~1` to get recently changed files

2. **For each file:**
   - Match the file path against the rule-to-path mapping above
   - Read each matching rule file
   - Extract every line containing `!IMPORTANT` or `NEVER`
   - Read the source file
   - Check each constraint against the actual code

3. **Report findings:**
   - Violation: `VIOLATION: <rule-file> — "<constraint text>" — <source-file>:<line>`
   - Pass: `PASS: <rule-file> — "<constraint text>"`
   - Summary: `X violations found, Y constraints checked`

## Example Output

```
Checking src/components/WidgetCard.tsx against components.md...
  PASS: components.md — "NEVER use string concatenation for class names — use cn()"
  VIOLATION: components.md — "NEVER inline fetch or API calls inside a component file" — WidgetCard.tsx:22

Checking src/app/[locale]/widgets/page.tsx against i18n.md...
  PASS: i18n.md — "NEVER hardcode user-facing strings — put them in locales/*.json"
  PASS: i18n.md — "NEVER import navigation utilities from next/navigation or next/link"

Summary: 1 violation found, 4 constraints checked
```
