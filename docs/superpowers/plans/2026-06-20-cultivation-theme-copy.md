# Cultivation Theme Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show light-cultivation terminology only in the cultivation theme while preserving every existing POP label.

**Architecture:** Add a typed, pure theme-copy dictionary beside the existing theme helpers and expose the active theme to page components through a small React context. Components read labels from the dictionary; task data, scoring rules, persistence, and cloud documents remain unchanged.

**Tech Stack:** React 18, TypeScript, Zustand, Node test runner, Vite

---

### Task 1: Theme Copy Dictionary

**Files:**
- Modify: `src/lib/theme.ts`
- Modify: `tests/theme.test.ts`

- [ ] Add failing tests proving POP labels remain unchanged and cultivation labels use `灵石`, `修为`, and `万象阁`.
- [ ] Run `node --experimental-strip-types --test tests/theme.test.ts` and confirm the new assertions fail.
- [ ] Add the typed copy dictionary and `getThemeCopy` helper.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Theme Context

**Files:**
- Create: `src/lib/themeContext.tsx`
- Modify: `src/components/Layout.tsx`

- [ ] Provide the active mode to descendants without changing persistence behavior.
- [ ] Replace sidebar terminology with theme-specific copy.
- [ ] Run `npx tsc --noEmit`.

### Task 3: Page Terminology

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/pages/Tasks.tsx`
- Modify: `src/pages/Shop.tsx`
- Modify: `src/pages/DataRecord.tsx`
- Modify: `src/pages/Review.tsx`
- Modify: `src/components/PointsAnimation.tsx`

- [ ] Apply light-cultivation labels to the dashboard and task workflow.
- [ ] Rename the cultivation shop to `万象阁` and use `灵石` throughout its purchase states.
- [ ] Rename navigation-level records and review labels while keeping health terms readable.
- [ ] Keep all POP strings exactly as they are today.

### Task 4: Verification

**Files:**
- Test: `tests/theme.test.ts`

- [ ] Run the focused theme tests.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build` once; if sandboxed esbuild returns `EPERM`, use the already-approved elevated build command once.
- [ ] Inspect the final diff for accidental scoring or persistence changes.
