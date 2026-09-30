---
name: diff-review
description: Review the local diff (git diff HEAD + untracked files) against a fixed checklist — types, error handling, missing tests, secrets — and report findings in a fixed severity table. Read-only.
argument-hint: '[focus area, optional]'
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep, Glob
---

# Diff review

Review ONLY the changes below. This is a read-only review: do not edit, write, stage, or commit anything.

## Changes

### git status

!`git status --short`

### git diff HEAD (lockfile excluded)

!`git diff HEAD -- . ':(exclude)pnpm-lock.yaml'`

Untracked files (`??` in the status) are not in the diff: Read the relevant ones (source, config, `.env*`) and review them as fully added. Skip build output and `node_modules/`.

If there are no changes at all, reply exactly `Sin cambios para revisar.` and stop.

If `$ARGUMENTS` is given, still run the full checklist but pay extra attention to that area.

## Checklist

Check every item against every changed hunk. Only report problems in lines the diff adds or modifies (or new files). Report pre-existing issues only if the change makes them worse.

### 1. Tipos

- `any` (explicit or implicit), `as` casts that bypass checks, non-null assertions (`!`), `@ts-ignore` / `@ts-expect-error` without a reason.
- Exported functions without an explicit return type.
- Relative imports missing the `.js` extension (required by NodeNext ESM).

### 2. Manejo de errores

- Empty `catch` blocks, or `catch` blocks that only log and continue when the caller needs to know.
- Promises not awaited or without error handling; `async` functions whose rejections are lost.
- Throwing non-`Error` values; losing the original error (no `cause`) when rethrowing.
- Unvalidated external input (env vars, `JSON.parse`, user input, file/network data) used as if trusted.

### 3. Tests faltantes

- New or changed exported function/behavior in `src/` with no matching change in a `*.test.ts`.
- New branches or error paths (if/else, catch, throws, edge values) without a test that exercises them.
- Tests modified to match new behavior without an explanation of why the old expectation was wrong.

### 4. Secretos

- API keys, tokens, passwords, private keys, connection strings with credentials, or high-entropy strings in code, config, or docs.
- `.env` or other secret files added to git; real values in `.env.example` (must be placeholders).
- Secrets logged or included in error messages.

## Severity criteria

- **ALTA**: exposed secret, a bug that produces wrong results or crashes, or a type hole (`any`/`!`/cast) on a path that can plausibly fail at runtime.
- **MEDIA**: missing error handling or missing test for new/changed behavior; unvalidated external input.
- **BAJA**: type-hygiene issues with no clear runtime impact (e.g. missing return type), minor test gaps.

## Output format (use exactly this, in Spanish)

```
## Revisión del diff

**Archivos revisados:** <n> · **Hallazgos:** <n> ALTA, <n> MEDIA, <n> BAJA

| # | Severidad | Categoría | Archivo:línea | Problema | Sugerencia |
|---|-----------|-----------|---------------|----------|------------|
| 1 | ALTA | Secretos | `src/config.ts:12` | ... | ... |

**Checklist:** Tipos ✅ · Errores ✅ · Tests ✅ · Secretos ✅

**Veredicto:** ✅ Aprobar
```

Rules:

- Sort rows by severity (ALTA → MEDIA → BAJA), then by file.
- `Categoría` is one of: `Tipos`, `Errores`, `Tests`, `Secretos`.
- `Archivo:línea` is the line in the new version of the file.
- `Sugerencia` is concrete: the code change or the test to add, in one or two sentences.
- If there are no findings, output a single row: `| - | - | - | - | Sin hallazgos | - |`.
- In **Checklist**, mark a category ❌ if it has any finding, ✅ otherwise.
- **Veredicto** is exactly one of:
  - `❌ Requiere cambios`: any ALTA finding.
  - `⚠️ Aprobar con cambios`: MEDIA findings, no ALTA.
  - `✅ Aprobar`: only BAJA or no findings.

Output the format as rendered Markdown (not inside a code block). Do not add sections, praise, or a summary beyond this format. Do not apply fixes; if the user wants them, they will ask.
