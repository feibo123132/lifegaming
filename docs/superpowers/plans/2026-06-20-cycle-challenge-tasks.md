# Cycle Challenge Tasks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user-configurable cycle challenges whose daily rewards increase by one point, support historical check-ins, and convert all unfinished rewards into an explicit failure penalty.

**Architecture:** Extend `Task` with an optional challenge state and keep all reward, penalty, date-range, and progress calculations in `gameSync.ts`. The Zustand store exposes explicit challenge check-in and failure actions; `Tasks.tsx` only collects configuration and renders/calls those actions. Existing one-time and recurring tasks remain unchanged.

**Tech Stack:** React 18, TypeScript, Zustand, Tailwind CSS, Node test runner.

---

### Task 1: Challenge domain calculations

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/gameSync.ts`
- Modify: `tests/gameSync.test.ts`

- [ ] Add failing tests for challenge creation, increasing daily points, valid date range, check-ins, final completion, failure penalty, and negative balances.
- [ ] Run `node --experimental-strip-types tests/gameSync.test.ts` and confirm the new tests fail for missing behavior.
- [ ] Implement the minimal challenge data and pure functions.
- [ ] Re-run the focused tests and confirm they pass.

### Task 2: Store actions and persistence

**Files:**
- Modify: `src/store/useGameStore.ts`

- [ ] Add explicit `completeChallengeDay` and `failChallenge` actions.
- [ ] Recalculate points after each challenge transition and sync the updated task state to CloudBase.
- [ ] Keep ordinary task toggles and daily-template generation unchanged.

### Task 3: Task creation and challenge card UI

**Files:**
- Modify: `src/pages/Tasks.tsx`

- [ ] Add mutually exclusive “每天自动出现” and “周期挑战” controls for daily tasks.
- [ ] Add a free positive-integer duration input when cycle challenge is enabled.
- [ ] Show challenge progress, selected-day points, total reward, historical completion state, and an explicit failure button.
- [ ] Route ordinary tasks to the existing toggle action and challenges to the new selected-date check-in action.

### Task 4: Negative experience display and verification

**Files:**
- Modify: `src/components/Layout.tsx`
- Modify: `src/pages/Dashboard.tsx`

- [ ] Clamp only the visual progress-bar width while preserving negative numeric experience.
- [ ] Run `node --experimental-strip-types tests/gameSync.test.ts`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `git diff --check` for the touched files.
- [ ] Attempt `npm run build` once; stop if the known `esbuild spawn EPERM` sandbox issue recurs.
