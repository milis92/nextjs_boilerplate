---
name: review-conventions
description: Audit feature code against convention rules, reporting violations with file:line references
---

# review-conventions

Audits existing code against the project's convention rules. Reports every imperative constraint violation with `file:line` references.

## Inputs

- `feature` — (optional) feature name or path to audit (e.g. `widgets`, `src/components/WidgetCard.tsx`). If omitted, audits all files changed since the branch diverged from `origin/main`.

## Rule-to-path Mapping

| Rule file                                | Applies to paths                                      |
| ---------------------------------------- | ----------------------------------------------------- |
| `.claude/rules/architecture.md`          | `src/app/**/*`                                        |
| `.claude/rules/code-style.md`            | `src/**/*.ts`, `src/**/*.tsx`                         |
| `.claude/rules/features/components.md`   | `src/app/**/_components/**`                           |
| `.claude/rules/features/actions.md`      | `src/app/**/_actions/**`                              |
| `.claude/rules/features/hooks.md`        | `src/app/**/_hooks/**`                                |
| `.claude/rules/features/data-loading.md` | `src/app/**/_hooks/**`, `src/app/**/_actions/**`      |
| `.claude/rules/features/layout.md`       | `src/app/**/layout.tsx`                               |
| `.claude/rules/features/page.md`         | `src/app/**/page.tsx`                                 |
| `.claude/rules/features/error.md`        | `src/app/**/error.tsx`, `src/app/**/global-error.tsx` |

## Procedure

1. **Identify files to audit:**
   - If a path/feature is provided: find all source files under that path
   - If not provided: run `git diff --name-only "$(git merge-base HEAD origin/main 2>/dev/null || git rev-parse HEAD~1)"` to get changed files. If `origin/main` is unavailable (fresh clone, offline) the command falls back to `HEAD~1`.

2. **For each file:**
   - Match the file path against the rule-to-path mapping above
   - Read each matching rule file in full
   - Identify all imperative constraints — bullets or sentences that **begin with** `NEVER`, `ALWAYS`, `Never`, or `Always`, or that contain `must` as a standalone word. **Exclude** content inside fenced code blocks and table example columns.
   - Read the source file
   - Check each constraint against the actual code

3. **Report findings:**
   - Violation: `VIOLATION: <rule-file> — "<constraint text>" — <source-file>:<line>`
   - Pass: `PASS: <rule-file> — "<constraint text>"`
   - Summary: `X violations found, Y constraints checked`

## Example Output

```
Checking src/app/[locale]/(auth)/_components/login-form.tsx against features/components.md...
  PASS: features/components.md — "NEVER fetch data inside a component with raw fetch()"
  VIOLATION: features/components.md — "NEVER export default from component files" — login-form.tsx:1

Checking src/app/[locale]/(auth)/login/page.tsx against features/page.md...
  PASS: features/page.md — "NEVER add conditional rendering or logic in page.tsx"
  PASS: features/page.md — "NEVER call server actions or data fetching functions directly in page.tsx"

Summary: 1 violation found, 4 constraints checked
```
