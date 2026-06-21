# Reward-Only Daily Tasks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add recurring daily tasks that grant rewards when completed but never penalize or reduce completion statistics when skipped.

**Architecture:** Persist an optional `rewardOnly` flag on both task instances and daily templates. Keep penalty, reflection, and completion-stat eligibility in `gameSync.ts`; the React pages only collect the option and render shared calculations.

**Tech Stack:** React 18, TypeScript, Zustand, Tailwind CSS, Node test runner.

---

### Task 1: Domain behavior

**Files:**
- Modify: `tests/gameSync.test.ts`
- Modify: `src/types/index.ts`
- Modify: `src/lib/gameSync.ts`

- [ ] Add failing tests for creation, reward granting, penalty exclusion, completion-stat exclusion, reflection exclusion, and daily-template inheritance.
- [ ] Run `node --experimental-strip-types --test tests/gameSync.test.ts` and confirm failures are caused by missing reward-only behavior.
- [ ] Add `rewardOnly` to task input, task instances, and daily templates.
- [ ] Exclude reward-only tasks from overdue penalties, reflection, and completion statistics.
- [ ] Re-run the focused tests and confirm they pass.

### Task 2: Creation and display UI

**Files:**
- Modify: `src/lib/theme.ts`
- Modify: `src/pages/Tasks.tsx`
- Modify: `src/pages/Dashboard.tsx`

- [ ] Add theme copy for “只奖不罚”.
- [ ] Add an independent checkbox next to “每天自动出现”.
- [ ] Reset conflicting options when cycle challenge is enabled.
- [ ] Send `rewardOnly` through the existing store action and show a task-card label.
- [ ] Reuse `calculateTaskCompletionStats` for the dashboard count and progress ring.

### Task 3: Verification

**Files:**
- Verify all touched files.

- [ ] Run `node --experimental-strip-types --test tests/gameSync.test.ts`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build` once; stop if the known sandbox `esbuild spawn EPERM` issue occurs.
- [ ] Run `git --no-optional-locks diff --check` and inspect the focused diff without modifying `.git`.
