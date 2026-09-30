---
name: changelog
description: Update CHANGELOG.md (Keep a Changelog format) from the git commits since the last tag, grouped by Conventional Commit type.
argument-hint: '[version, e.g. 1.0.0 — omit to update Unreleased]'
disable-model-invocation: true
allowed-tools: Bash(git describe:*), Bash(git log:*), Bash(git tag:*), Read
---

# Update CHANGELOG.md

## 1. Find the commit range

1. Run `git describe --tags --abbrev=0`.
   - If it prints a tag, the range is `<tag>..HEAD`.
   - If it fails ("No names found"), there are no tags: use the whole history (`HEAD`).
2. Run `git log <range> --no-merges --format='%h%x1f%s%x1f%b%x1e'` (fields: short hash, subject, body; records end with `\x1e`).
3. If there are no commits in the range, reply `No hay commits nuevos desde <tag>.` and stop without touching any file.

## 2. Classify each commit

Parse the subject as `type(scope)!: description`. `scope` and `!` are optional. Map it to a Keep a Changelog section:

| Conventional Commit type                                 | Section                          |
| -------------------------------------------------------- | -------------------------------- |
| `feat`                                                   | Added                            |
| `fix`                                                    | Fixed                            |
| `fix` with scope `security`, or `security`               | Security                         |
| `perf`, `refactor`, `revert`                             | Changed                          |
| Subject starting with "remove"/"delete" (any type above) | Removed                          |
| Subject or body mentioning "deprecate"                   | Deprecated                       |
| `docs`, `style`, `test`, `build`, `ci`, `chore`          | Omit (not user-facing)           |
| Not a Conventional Commit                                | Changed (keep the subject as is) |

- **Breaking changes** (`!` after the type/scope, or `BREAKING CHANGE:` in the body) go in their mapped section, prefixed with `**BREAKING:**`.
- Entry format: `- <description with first letter capitalized, no trailing period> (<short hash>)`. If there is a scope: `- **<scope>:** <description> (<short hash>)`.
- Keep commit order: newest first within each section.

## 3. Update CHANGELOG.md

- If `CHANGELOG.md` doesn't exist, create it with this header:

  ```markdown
  # Changelog

  All notable changes to this project will be documented in this file.

  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

  ## [Unreleased]
  ```

- **Without `$ARGUMENTS`**, add the entries under `## [Unreleased]`.
- **With a version in `$ARGUMENTS`** (e.g. `1.0.0`), move everything in `[Unreleased]` plus the new entries into a new `## [<version>] - <today YYYY-MM-DD>` section right below an empty `## [Unreleased]`.
- Sections within a release go in this order, and empty sections are omitted: Added, Changed, Deprecated, Removed, Fixed, Security.
- **No duplicates:** skip any commit whose short hash already appears in `CHANGELOG.md`.
- Never rewrite existing released sections. Only touch `[Unreleased]` or the new version section.
- Format for Prettier: `-` bullets, one blank line around headings, file ending in a newline.

## 4. Report

Reply in Spanish with:

- The range used (`<tag>..HEAD` or `todo el historial`) and the number of commits read.
- How many entries went into each section.
- Commits omitted (`docs`, `chore`, etc.) and non-conventional commits, listed by hash so the user can review them.

Do not create tags, stage, or commit. The user decides when to do that.
