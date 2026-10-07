# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (pinned via `packageManager` in `package.json`). Node ≥20.

- `pnpm install` — install dependencies
- `pnpm build` — compile `src/` to `dist/` with `tsc`
- `pnpm start` — run the compiled server (`dist/server.js`); needs `pnpm build` first. Listens on `PORT` (default `3000`) and `HOST` (default `0.0.0.0`)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — run all tests once with Vitest (`pnpm test:watch` for watch mode)
- Single test file: `pnpm test src/index.test.ts`
- Single test by name: `pnpm vitest run -t "<test name>"` or `pnpm test -- -t "<test name>"`. Through the `test` script the `--` is required, or pnpm drops the `-t` flag silently.
- `/test [filter]` — Claude Code skill (`.claude/skills/test/`) that runs the tests and diagnoses failures without editing code
- `/diff-review [focus]` — read-only review of the local diff with a fixed severity table (named to avoid the built-in `/review` and `/code-review`)
- `/changelog [version]` — updates `CHANGELOG.md` (Keep a Changelog) from commits since the last tag, grouped by Conventional Commit type. User-invoked only (`disable-model-invocation: true`); never creates tags or commits
- `/start-task <description>` — syncs `master`, creates a `<type>/<description>` branch after confirmation, and starts the task plan-first. Commits use Conventional Commits without scope (not a monorepo). User-invoked only
- `pnpm coverage` — tests with v8 coverage; reports (text, HTML at `coverage/index.html`, `coverage/lcov.info`) go to `coverage/`
- `pnpm lint` / `pnpm lint:fix` — ESLint over the whole repo (`dist/` and `coverage/` ignored)
- `pnpm format` / `pnpm format:check` — Prettier over the whole repo (respects `.gitignore` and `.prettierignore`)

## Setup notes

- ESM project (`"type": "module"`) compiled with `module`/`moduleResolution: NodeNext`: relative imports in `.ts` files must use the `.js` extension (e.g. `import { sum } from './index.js'`).
- TypeScript runs in `strict` mode. There is a single `tsconfig.json`, which excludes `src/**/*.test.ts` so tests aren't emitted to `dist/`. As a result, `pnpm typecheck` does **not** type-check test files, and Vitest runs them without type-checking.
- Tests live next to their source as `src/**/*.test.ts`, configured in `vitest.config.ts` (Node environment). Coverage uses `@vitest/coverage-v8` over `src/**/*.ts` (tests excluded), so untested source files show up at 0%. The terminal `text` report hides files that are 100% covered. Coverage thresholds are 80 % for lines, functions, branches and statements; `pnpm coverage` fails below that (plain `pnpm test` doesn't collect coverage, so it doesn't enforce them). `src/server.ts` is excluded from coverage.
- The HTTP API uses Fastify 5. `src/app.ts` exports `buildApp(options?)`, a factory that creates the Fastify instance and registers routes/plugins but never calls `listen()`. `src/server.ts` is the only entry point that listens; keep it logic-free, since it isn't tested or covered. New routes go in `buildApp()` (or plugins it registers).
- Test HTTP routes with `app.inject()` on a fresh `buildApp()` per test, not with a real port or supertest: `inject()` runs requests in-process with no network, and `await app.close()` in `afterEach` releases hooks/plugins. See `src/app.test.ts`.
- Vitest is pinned to `^4` because Vitest 5 requires Node ≥22.12. `@vitest/coverage-v8` must stay on the exact same version as `vitest` (peer dependency), so upgrade them together.
- `vitest.config.ts` and `eslint.config.js` sit outside `tsconfig.json`'s `include`, so `tsc` doesn't check them. ESLint and Prettier still do.
- ESLint 9 uses a flat config in `eslint.config.js` (loaded as ESM): `@eslint/js` recommended + `typescript-eslint` recommended, with Node globals. Linting is **not** type-aware, because test files sit outside `tsconfig.json`, so `projectService` would reject them.
- Prettier owns formatting and ESLint only checks code quality. `eslint-config-prettier/flat` must stay the **last** entry in `eslint.config.js` so it disables any conflicting ESLint style rules. Prettier config is `.prettierrc.json` (only `singleQuote: true`), and Prettier is pinned to an exact version because even minor releases can change its output.
- TypeScript is pinned to 5.x because `typescript-eslint` only supports TypeScript `<6.1`. Don't upgrade TypeScript past that range until typescript-eslint supports it.
- `.gitattributes` forces LF line endings (`* text=auto eol=lf`) so Prettier's `format:check` passes on Windows checkouts with `core.autocrlf=true`.
- CI (`.github/workflows/ci.yml`) runs on pushes to `master` and on every PR, on Node 20, 22 and 24: `pnpm install --frozen-lockfile`, then `typecheck`, `lint`, `format:check` and `coverage` (which runs the tests and enforces the thresholds). pnpm's version comes from `packageManager`, so bump it there, not in the workflow.
- Claude Code permissions live in `.claude/settings.json` (versioned, shared): pnpm test/lint/format/typecheck and `git status`/`diff`/`log` are allowed, `git push` and `pnpm add` always ask, and reading `.env` / `.env.*` is denied. Personal overrides go in `.claude/settings.local.json` (not committed).

## Workflow

New behavior is built test-first, one small TDD cycle at a time, each phase in its own commit (Conventional Commits, no scope):

1. **Red** — write the tests for the new behavior (HTTP routes via `app.inject()`, see above) and the minimum code needed for them to compile and fail on an assertion rather than an import or type error. For a new route that means registering it as a stub that answers `501` (`reply.code(501).send())`). Types, repositories and other infrastructure the design requires can be written in full in this phase; only the behavior under test stays unimplemented. Run `pnpm test` and confirm the new tests fail for the expected reason and existing tests still pass. Commit as `test: ...`.
2. **Green** — write the simplest implementation that makes the tests pass, without adding untested behavior. Run `pnpm test`, `pnpm typecheck` and `pnpm lint`. Commit as `feat: ...` (or `fix: ...`).
3. **Refactor** — clean up with the tests green (duplication, naming, extracting plugins/modules). Tests must not change meaning. Run `pnpm coverage` (80 % thresholds), `pnpm lint` and `pnpm format:check`. Commit as `refactor: ...`; skip the phase if there is nothing to clean up.

Don't move to the next phase or commit without the user's go-ahead when they are driving the cycle phase by phase. In the red phase, `pnpm lint` may fail on dependencies that are wired in but not yet used (e.g. an injected repo); that is expected and must be fixed in green.
