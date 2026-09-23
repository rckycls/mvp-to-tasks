# Decomposition rules

## Phases (3–6)
A typical order is shown below. Adapt it to the product, and merge or drop phases that don't apply.
1. **Foundation:** repo setup, stack, config, CI, database schema, auth skeleton.
2. **Core loop:** the one thing a user must be able to do, working end to end.
3. **Supporting features:** everything else that is in scope.
4. **Polish & hardening:** error states, empty states, validation, basic tests, accessibility.
5. **Launch:** deploy, environment variables and secrets, monitoring, seed data, README.

Scaffold task tip: `.mvp/` (and often `.git/`) already exist, and most scaffolding CLIs (e.g. `create-next-app`) refuse to run in a folder that isn't empty. Put a note on the scaffold task's first sub-task: "scaffold in a temp folder and merge, or use the CLI's in-place option; keep `.mvp/` and `.git/`".

Each phase needs an **exit criterion** someone can observe, e.g. "A new user can sign up, create a project and see it listed." Avoid vague criteria like "backend done".

Put the core loop as early as possible. A thin end-to-end slice is worth more than a finished layer.

## Tasks
- **Vertical slices over horizontal layers.** "Create project: API + form + list view" is better than separate "all APIs" and "all UI" tasks.
- **One deliverable** per task, with **1–3 acceptance criteria** (separated by semicolons) that someone can check in a couple of minutes (a test passes, a page renders, a curl request returns X). Needing more than 3 means the task should be split.
- **Dependencies** point only to earlier task IDs, and there must be no cycles.
- **Order tasks inside a phase** so that the first unblocked task is always the most valuable next step.

## Sizing checklist (run it on every task)
Get the thresholds from the user's profile in `plan-budgets.md`. A task **must pass every check**. If it fails any of them, split it and check the pieces again.

| # | Check | Pro default |
|---|---|---|
| 1 | Single clear deliverable | yes |
| 2 | Files created or changed | ≤ 8 |
| 3 | New subsystems or integrations (auth provider, payment, queue, new external API) | ≤ 1 |
| 4 | Dependency handoffs needed in "Context to load" | ≤ 3 |
| 5 | Existing files that must be read to do it | ≤ 8 |
| 6 | Verifiable by a quick test or manual check | yes |
| 7 | No open research ("figure out which library…") | yes. Make a separate S "spike" task that ends in a decision |

**How to split:**
- by entity (users, then projects)
- by operation (create/read, then update/delete)
- by layer only when a vertical slice would be too large (data + API, then UI)
- happy path first, then edge cases
- setting up an integration (spike + wiring), then using it

**Size labels** (relative to a Pro window):
- **S:** a focused chunk, about ¼ of a window or less.
- **M:** about ⅓ of a window.
- **L doesn't exist.** Split anything that would be L.

The goal is for a Pro user to finish **2–4 tasks per window** (fewer when they are heavy), leaving room for debugging and a buffer.

## Sub-tasks (checkpoints)
- Each task gets 2–6 sub-tasks. Each sub-task leaves the code in a **working, committable state**.
- Order them so that the risky or unknown part comes first.
- Make the last sub-task the verification step: "Verify: <acceptance check> + write handoff".
- Sub-tasks are not separate sessions. They are save points *inside* one session, so that a task cut off by the usage limit can resume from the last checked sub-task.

## Model hint (per task)
Give every task a `Model:` hint. `next-task` uses it to run light tasks on a cheaper model, which saves usage. A Pro window stretches much further on Sonnet than on Opus.

| Hint | Runs on | Use for |
|---|---|---|
| `light` | Sonnet | Scaffolding, config, CRUD following an existing pattern, UI built from existing components, copy and styling changes, simple tests, docs, deploy steps from a known guide |
| `heavy` | Opus | Data model or schema design, auth and security, payments, concurrency, non-trivial algorithms, the first use of a new integration, cross-cutting refactors, debugging something unclear, spike tasks that end in a decision |

Default to `light`. Choose `heavy` only when a wrong decision would be expensive to undo, or when the task needs real reasoning rather than following a pattern.

**Tie-breaker:** if any part of the task touches a `heavy` area, the task is `heavy`. That includes permissions or role checks, admin/auth APIs, overlap or conflict logic, and money. The only exception is when you split that part out into its own `heavy` task, which is usually the better move because the remaining work can then run on the cheaper model.

## Context to load (per task)
List only what a fresh session needs:
- `brief.md` sections, e.g. `brief#Stack`, `brief#Data model`.
- Handoffs: `H:T-003`. List only the tasks whose output this task **actually uses**, and never the whole chain, because each handoff already summarizes what came before it. A needed task can sit further back in the chain, e.g. an emails task needs the email setup from the auth task. **Every handoff you list must also be listed in "Depends on"**, so that "all dependencies done" guarantees every note the task loads exists.
- Files and directories, e.g. `src/db/schema.ts`, `src/routes/projects/`. Files that dependency tasks will create are allowed too.

If the list goes over the thresholds in checks 4 and 5, the task is too big. Split it.
