# CLAUDE.md

## Code principles

- **Clean code always.** Every function, constant, and section must be named clearly and do one thing.
- **Comment all code.** Every function gets a comment explaining what it does and why. Every non-obvious block gets an inline comment. Magic numbers get a unit or meaning comment.
- **No dead code.** Remove unused variables, unreferenced classes, and leftover debug logs.
- **No premature abstractions.** Three similar lines are better than a helper that is only called twice.
- **No backwards-compatibility hacks.** If something is unused, delete it entirely.

---

## Conventions

- Always read existing files before editing them.
- Match the exact indentation style of the file being edited.
- Place new constants, state, and helpers near their existing counterparts — keep related things together.
- New state variables should be named with a clear prefix or scope that makes their purpose obvious at a glance.
