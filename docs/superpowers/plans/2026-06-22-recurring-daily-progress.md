# Recurring Daily Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show cumulative `completed/settled` progress on every recurring daily task card.

**Architecture:** Add a pure progress selector to `gameSync.ts` that groups recurring task instances by `templateId` and applies the settled-day cutoff. Keep `Tasks.tsx` presentation-only by rendering the selector result beside the existing “每天” badge.

**Tech Stack:** TypeScript, React 18, Node test runner

---

### Task 1: Recurring daily progress selector

**Files:**
- Modify: `src/lib/gameSync.ts`
- Test: `tests/gameSync.test.ts`

- [ ] Add a failing test whose 2026-06-09 through 2026-06-21 records contain 11 completions and 2 failures, plus an unfinished 2026-06-22 record; expect `{ completed: 11, total: 13 }`.
- [ ] Add failing boundary assertions showing a completed current-day instance becomes `{ completed: 12, total: 14 }`, future instances are ignored, and another `templateId` does not affect the result.
- [ ] Run `node --experimental-strip-types --test tests/gameSync.test.ts` and confirm failure because the selector is missing.
- [ ] Implement a pure exported `getRecurringDailyTaskProgress(tasks, task, today)` helper with `templateId` grouping and the agreed date cutoff.
- [ ] Re-run the targeted test and confirm it passes.

### Task 2: Task-card badge

**Files:**
- Modify: `src/pages/Tasks.tsx`

- [ ] Import the selector and calculate progress only for recurring daily task cards.
- [ ] Render a yellow `completed/total` badge immediately after the existing “每天” badge.
- [ ] Run `node --experimental-strip-types --test tests/gameSync.test.ts`.
- [ ] Run `npm run build` to verify TypeScript and the production bundle.

Git staging and commits are intentionally omitted because this repository's sandbox instructions prohibit writes to `.git`.
