# Browser Password Autofill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reliably let Chrome or Edge autofill the last successful account and its saved password after the app returns to the login page, without storing passwords in application data.

**Architecture:** Keep the last successful email in the existing local key through small storage helpers, while delegating password storage to the browser. Make the password form semantically recognizable with stable names, autocomplete tokens, and form association; keep existing CloudBase session monitoring and local game-data recovery unchanged.

**Tech Stack:** React 18, TypeScript, Zustand, CloudBase Web SDK, Node test runner.

---

### Task 1: Safe login prefill model

**Files:**
- Modify: `tests/defaultLoginCredentials.test.ts`
- Modify: `src/lib/defaultLoginCredentials.ts`

- [ ] Write failing tests for environment-email precedence, remembered-email fallback, blank normalization, password-mode selection, and storage read/write.
- [ ] Run `node --experimental-strip-types tests/defaultLoginCredentials.test.ts` and confirm failures are caused by missing remembered-email behavior.
- [ ] Remove password environment handling and add injected-storage helpers using `design_life_user_email`.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Authentication state integration

**Files:**
- Modify: `src/store/useAuthStore.ts`
- Modify: `src/pages/LoginPage.tsx`

- [ ] Save the normalized email only after CloudBase reports a successful user login.
- [ ] Preserve the remembered email when the session becomes anonymous or logged out.
- [ ] Initialize the login page from the environment email or remembered email.
- [ ] Default to password mode when an email is available.
- [ ] Associate the email field with the active login form and add standard username/password names and autocomplete tokens.

### Task 3: Remove unsafe password defaults

**Files:**
- Modify: `.env.example`

- [ ] Remove the default password variable and any credential-looking example value.
- [ ] Explain that passwords must be stored by Chrome or Edge, not Vite environment variables.

### Task 4: Verification

**Files:**
- Verify all touched source and test files.

- [ ] Run `node --experimental-strip-types tests/defaultLoginCredentials.test.ts`.
- [ ] Run `node --experimental-strip-types tests/authErrors.test.ts`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build` once; stop on the known sandbox `esbuild spawn EPERM` condition.
- [ ] Run `git --no-optional-locks diff --check` and inspect the focused diff.

