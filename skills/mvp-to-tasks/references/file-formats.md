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

## Importable CSV (fallback when no connector is available)

Columns: `ID,Title,Description,Phase,Size,Model,Depends On,Parent ID`
- Put each phase in the `Phase` column, and put sub-tasks on their own rows with `Parent ID` filled in.
- The `Description` includes the goal, acceptance criteria and "Context to load".
- Point the user to their tool's CSV import. The tool guides give the field mapping for each tool.
