# Repository Instructions

## Git commands in the Codex sandbox

- The `.git` directory is read-only inside the Codex sandbox.
- Never run plain `git status` in the sandbox because Git may create
  `.git/index.lock` and then fail to remove it.
- Use `git --no-optional-locks status` for status checks.
- Prefer `git --no-optional-locks diff` and other read-only Git commands.
- Do not stage, commit, or otherwise write to `.git` from the sandbox.
- If `.git/index.lock` exists, first confirm that no Git process is active;
  only then remove the stale lock with elevated permission.
