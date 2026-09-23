# File formats

Everything lives in `.mvp/` at the project root:
```
.mvp/
  brief.md
  tasks.md
  handoffs/        # T-xxx.md per completed task; T-xxx.wip.md checkpoint log while a task is in progress (both written by next-task)
```

---

## brief.md (keep it to one page or less)

It gets loaded at the start of **every** task session, so each line has to be worth that cost. Use headings exactly as below so that tasks can reference them as `brief#Stack` and so on.

```markdown
# <Product name>: Brief
_Last updated: <YYYY-MM-DD> by <T-xxx or "planning">_

## Goal
<1–2 sentences: who it's for and the one thing they must be able to do.>

## Users
- <primary user>: <what they need>

## Scope
**In:** <feature>, <feature>, <feature>
**Out (v2+):** <feature>, <feature>

## Stack
<framework, language, DB, hosting, key libraries>

## Conventions
- <folder layout, naming, test command, lint/format command, styling approach>

## Data model
- <Entity>: <key fields>; relations

## Key decisions
- <decision> (<why>, T-xxx)

## Assumptions
- <assumption made during planning>
```

---

## tasks.md

```markdown
# <Product name>: Tasks
Plan: <Pro|Max 5x|Max 20x> · <N> tasks (<a> light · <b> heavy) · ~<X–Y> usage windows · Tool: <none|Linear|Jira|Trello|…>

> Work one task per session: say **"next task"**. Each session loads only brief.md,
> the listed handoffs, and the listed files. If you hit the usage limit mid-task,
> the next session resumes from the last checked sub-task.

Status: `[ ]` todo · `[~]` in progress · `[x]` done

## Phase 1: <Name>
**Goal:** <one sentence> · **Exit:** <observable criterion>
<!-- next-task adds "**Exit check:** passed <date> · <evidence>" here when the phase is verified end to end -->

### [ ] T-001 · <Title> · S
- **Goal:** <one sentence>
- **Depends on:** none
- **Model:** light
- **Acceptance:** <checkable criterion>; <criterion>
- **Context to load:** brief#Stack, brief#Conventions · files: `package.json`
- **Link:** <PM tool URL or blank>
- Sub-tasks:
  - [ ] <checkpoint 1>
  - [ ] <checkpoint 2>
  - [ ] Verify: <acceptance check> + write handoff

### [ ] T-002 · <Title> · M
- **Goal:** …
- **Depends on:** T-001
- **Model:** heavy
- **Acceptance:** …
- **Context to load:** brief#Data model · H:T-001 · files: `src/db/schema.ts`
- **Link:**
- Sub-tasks:
  - [ ] …

## Phase 2: <Name>
…
```

Rules:
- Task IDs are global and never reused. If a task gets split later, use `T-007a` and `T-007b`.
- Change a task heading to `[~]` when work starts and to `[x]` when the handoff has been written.
- Don't record any other progress here. Details go in the handoffs.

---

## handoffs/T-xxx.md (200 words max, fact-checked)

The next session reads this **instead of** the conversation or the diff. Write down the facts a successor needs, not a story of what happened.

```markdown
# H:T-xxx · <Title>
_Done: <YYYY-MM-DD>_

**Built:** <1–2 sentences on what now exists and works.>
**Decisions:** <decision> — <why>. (Only non-obvious ones.)
**Files/APIs:** `path` (what it is) · `METHOD /route` (shape) · `functionName()` (purpose)
**Gotchas:** <anything surprising: env vars, quirks, workarounds, known limits>
**For next tasks:** <what downstream tasks must know or reuse>
**Verify:** <command or steps that prove it works>
**Evidence:** <command → key result lines, exit code> (required before the task can be marked [x])
```

---

## Import files (fallback when no connector is available)

**Don't write import files by hand.** Generate them from tasks.md, because every tool has strict, different import rules:

```
node <this skill's dir>/scripts/export-plan.mjs .mvp <target> [options] > <output file>
```

| Target | Output | What it produces | Import with |
|---|---|---|---|
| `jira` | `.mvp/plan-jira.csv` | Phases → **Epic**, tasks → **Story**, steps → **Subtask**. Uses the numeric `Work item ID`, `Work type` and `Parent` columns Jira requires for hierarchy, with sequential IDs and parents first. Options: `--task-type Task`, `--subtask-type Sub-task`. | Jira's **External system import → CSV** (see `tools/jira.md`) |
| `linear` | `.mvp/plan-linear.csv` | Linear's own CSV export format: one row per task, the phase as a label (labels joined with `", "`), priority as text, steps as a checklist in the description. | `npx @linear/import` → **Linear (CSV export)** (see `tools/linear.md`) |
| `github` | `.mvp/plan-github.sh` | A `gh` CLI script. Phases → **milestones**, tasks → **issues** with labels, steps → a checklist, or real **sub-issues** with `--sub-issues`. `--project "Title"` also adds each issue to a GitHub Project board. Writes `.mvp/github-map.txt` (task ID → issue URL). | `bash .mvp/plan-github.sh` (see `tools/github.md`) |
| `trello` | `.mvp/plan-trello.txt` | Paste-ready text, one block per phase. Pasting lines into a Trello list creates one card per line. | Paste (see `tools/trello.md`) |
| `generic` | `.mvp/plan.csv` | One row per phase, task and step, with `ID`, `Type` and `Parent ID` columns. | Asana, ClickUp, Notion, spreadsheets and similar tools |

Every task description includes the goal, the acceptance criteria, dependencies, the Model hint and "Context to load". Then tell the user how to import it, using the tool guide's **fallback** section.

If Node isn't available, write the file by hand, following the same columns and rules exactly.
