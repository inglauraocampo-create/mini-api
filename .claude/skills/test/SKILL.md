---
name: test
description: Run the project's Vitest tests (optionally filtered) and, if any fail, diagnose the root cause without changing code until the user approves a fix.
argument-hint: '[file-path-or-pattern | -t "test name"]'
allowed-tools: Bash(pnpm test:*), Read, Grep, Glob
---

# Run tests

Run the test suite and report the result.

## 1. Run

- If `$ARGUMENTS` is empty, run: `pnpm test`
- Otherwise, run: `pnpm test -- $ARGUMENTS`
  - A path or filename fragment filters test files (e.g. `src/index`).
  - `-t "<name>"` filters by test name.
  - The `--` is required: without it pnpm swallows flags like `-t` instead of forwarding them to Vitest, and the filter is silently ignored.

Always use `pnpm test`, never watch mode (`pnpm test:watch` or plain `vitest`), which never exits.

If a filter matches nothing, Vitest reports the tests as **skipped** (or "No test files found"). Say that the filter matched no tests instead of reporting success.

## 2. If everything passes

Reply briefly: number of test files and tests that passed, and the filter used (if any). Stop there.

## 3. If something fails

**Do not modify any file.** No Edit, Write, or shell commands that change files. This is diagnosis only.

For each failing test:

1. Identify the test (file and name) and the actual vs. expected values from the output.
2. Read the test and the source code under test (Read/Grep/Glob) to find the root cause.
3. Decide whether the bug is in the **source code**, the **test itself**, or the **environment/config** (e.g. missing dependency, Vitest config, ESM import without `.js` extension).

Then report:

- **Qué falló:** test, file:line, and the assertion error.
- **Causa:** the root-cause explanation, pointing to the exact lines.
- **Fix propuesto:** the concrete change (as a diff or a short description) and which file it touches.

End by asking the user whether to apply the proposed fix. Only change code after they explicitly approve.

If the tests fail to run at all (compile/config error, no tests found for the filter), explain that instead and suggest the corrected command or config fix, again without applying it.
