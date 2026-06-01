# Crossmint Escape Room: Project Conventions

Project-level conventions for Claude Code working in this repo.

## Stack

Vite + React 19 + TypeScript, `@react-three/fiber` v9, `@react-three/drei` v10, Tailwind, deployed to Vercel. Package manager: **bun** (never npm/pnpm/yarn).

## Code style

- **No `any`. No unnarrowed `unknown`.** Define interfaces/types when non-trivial; let TS infer when obvious.
- **Named exports only for components.** No `export default`.
- **Arrow function components**: `export const Foo: React.FC<Props> = (...) => { ... }`. Same for utilities: `const add = (a: number, b: number) => a + b`.
- **`import * as React from 'react'`** (namespace import), then `React.useState(...)`, `React.FC<Props>`, etc.
- **Absolute imports with `@/`** for cross-directory. Same-directory `./` is fine. Parent-directory `../` is forbidden. Alias `@/*` → `./src/*` configured in `tsconfig.app.json` and `vite.config.ts`.
- **Formatting**: 80-char line width, 2-space indent, single quotes (JSX too), trailing commas where valid.

## Language

For all prose (pushed files, in-game text, conversation back to the user): talk like a person. Short sentences. One idea per sentence. Avoid AI-promotional language and em dashes. Cut anything that decorates rather than informs.

When asking the user to clarify, prefer multiple-choice over open-ended. When uncertain, verify before guessing.

## Anti-slop rules

- No comments explaining WHAT code does. Comments only for non-obvious WHY.
- No speculative abstractions. No `PuzzleManager` / `Registry` / `Factory` triads. Flat arrays and explicit code until a third concrete use forces extraction.
- No dead code, no unused types, no half-finished implementations.
- No automated tests for this challenge. Manual playtest is the validation, documented in the README as an explicit trade-off.
- If you generate something that smells like AI slop (boilerplate types, unused imports, over-defensive validation at internal boundaries), delete it before reporting done.

## Confirm-before-doing

- Writes that land in pushed files (`AI_LOG.md`, `README.md`): confirm first.
- Architecture decisions (state shape, puzzle interface, file layout): propose first, implement after approval.
- Git commits and pushes: never run without an explicit user request. When committing, plain commit message body. No `Co-Authored-By:` trailer, no robot/Claude attribution.
- Mechanical work (installs, file moves, scaffolds, smoke tests): proceed and report.
