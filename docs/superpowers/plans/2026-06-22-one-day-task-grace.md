# One-Day Task Grace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an eligible unfinished task move from today to tomorrow once, reducing its success reward by 10 while preserving the original points as the triple-penalty basis.

**Architecture:** Store immutable grace metadata on the task and keep eligibility, date movement, reward reduction, and penalty calculations in `gameSync.ts`. Expose one Zustand action for persistence/sync; `Tasks.tsx` only renders eligibility, confirmation details, and the card action.

**Tech Stack:** React 18, TypeScript, Zustand, CloudBase Web SDK, Tailwind CSS, Node test runner.

---

### Task 1: Grace domain behavior

**Files:**
- Create: `tests/taskGrace.test.ts`
- Modify: `src/types/index.ts`
- Modify: `src/lib/gameSync.ts`

- [ ] Add failing tests for eligibility and one-use enforcement.
- [ ] Run `node --experimental-strip-types tests/taskGrace.test.ts` and confirm the new tests fail for missing grace behavior.
- [ ] Add task grace metadata and pure eligibility/mutation functions.
- [ ] Add failing tests for date movement, 10-point reward decay, zero floor, completion rewards, and original-points triple penalties.
- [ ] Implement the minimal calculations and re-run the focused test.
- [ ] Add tests proving recurring templates, challenges, reward-only tasks, completed tasks, and non-today tasks are ineligible.

### Task 2: Store action and persistence

**Files:**
- Modify: `src/store/useGameStore.ts`

- [ ] Add `graceTaskOneDay(taskId, dateKey)` to the store interface and implementation.
- [ ] Update local tasks only when the domain function returns a changed task.
- [ ] Recalculate points and sync through the existing CloudBase flow.

### Task 3: Task card interaction

**Files:**
- Modify: `src/lib/theme.ts`
- Modify: `src/pages/Tasks.tsx`
- Test: `tests/theme.test.ts`

- [ ] Add theme copy for “宽限1天” and “已宽限一次”, with a failing copy test first.
- [ ] Add an orange clock action between score and edit controls for eligible tasks only.
- [ ] Show a confirmation containing date, reward, and failure-penalty changes.
- [ ] Stop button clicks from toggling task completion.
- [ ] Show the grace status tag and lock point editing after grace is used.

### Task 4: Verification

**Files:**
- Verify all touched files.

- [ ] Run `node --experimental-strip-types tests/taskGrace.test.ts`.
- [ ] Run `node --experimental-strip-types tests/theme.test.ts`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build` once; stop on the known sandbox `esbuild spawn EPERM` condition.
- [ ] Run `git --no-optional-locks diff --check` and inspect the focused diff.
