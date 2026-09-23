---
name: next-task
description: Works through an MVP plan made by mvp-to-tasks one task per session, loading only lean context (the project brief, the handoff notes of the tasks it depends on, and the task's listed files) so each session stays inside a Pro plan's 5-hour usage window. Checks off sub-tasks as checkpoints, resumes interrupted tasks, writes a short handoff note for the next session, runs light tasks on Sonnet and heavy tasks on Opus (via a subagent in Claude Code; recommends a model in claude.ai), and syncs status to Linear/Jira/Trello if linked. Use when the user says "next task", "continue the MVP", "work on T-012", "resume", or "what's next".
---

# Next task: build one task with lean context

This skill does one task per session. It loads as little as possible, writes a handoff, and then stops. That keeps each session small enough to fit in a usage window, and the handoff lets the next session pick up where this one ended without the previous conversation.

## Step 1: Find the plan
- Look for `.mvp/tasks.md` and `.mvp/brief.md` at the project root.
- If they're missing, check whether the user linked a PM tool project that has "T-xxx · " items. If so, work from the tool, using the item description as the task.
- If there is no plan at all, say so and suggest running **mvp-to-tasks** first. Stop.

## Step 2: Pick the task
Choose the task in this order:
1. If the user named a task ("work on T-012"), use that one.
2. Otherwise, **resume** any task marked `[~]`, starting at its first unchecked sub-task.
3. Otherwise, if a phase is fully `[x]` but has no passed exit check, run its **Phase exit check** (below) instead of a task.
4. Otherwise, take the first `[ ]` task whose dependencies are all `[x]`.

State which task you picked and why in one line, e.g. "Resuming T-004 at sub-task 3/4." If every remaining task is blocked, list what blocks each one and stop.

### Resuming an interrupted task (`[~]`)
The previous session may have been cut off by the usage limit with no warning, so don't assume it stopped cleanly. Before doing any new work:
1. **Read the checkpoint notes** in `.mvp/handoffs/T-xxx.wip.md`. They record every finished sub-task and the decisions behind it.
2. **Find leftover work from the interrupted sub-task:**
   - **With git:** run `git status` and `git diff` to see uncommitted changes. Finished sub-tasks are usually already committed, so anything uncommitted most likely belongs to the sub-task that was cut off.
   - **Without git:** compare the task's listed files, and any files named in the checkpoint notes, against what the ticked sub-tasks say should exist.
3. **Decide what to do with the half-finished sub-task:**
   - **Keep and finish it** if the partial work is coherent and heading the right way.
   - **Discard and redo it** if the work is broken or confusing. Revert only the uncommitted changes for that sub-task (`git restore <files>`, or undo them by hand), never earlier committed work. **Ask before discarding anything.**
4. **Check the saved state.** If a ticked sub-task isn't actually working (for example, the build fails), untick it and redo it first.
5. **Say what you found** in 1–2 lines before continuing, e.g. "T-004: sub-tasks 1–2 done; found a half-written `ProjectForm.tsx` from sub-task 3. Keeping it and finishing sub-task 3."

## Model routing
Every task has a `Model:` hint. `light` runs on **Sonnet** and `heavy` runs on **Opus**. If the hint is missing, treat the task as `light`. If the user asks for a specific model ("use Opus for this"), that choice wins. Say the choice in one line, e.g. "T-004 is light, so it runs on Sonnet to save usage."

**If you can start a subagent with a chosen model (Claude Code):** hand Steps 3–6 to a subagent on the matching model. In the main session, do only Steps 1–2 and Step 7.
- **Write the subagent prompt so it stands on its own.** It won't see this conversation. Include:
  - the task ID and title
  - the paths to `.mvp/brief.md`, `.mvp/tasks.md` and `.mvp/handoffs/`
  - the resume point, and your keep/discard decision if resuming
  - the full text of Steps 3–6 and the "Never write secrets" section of this skill
- **Tell the subagent it can't ask the user questions.** If it hits a decision that belongs to the user, or a blocker, it must write its checkpoint line, stop, and return the question. Relay the question to the user, then continue in a new subagent after they answer.
- **When the subagent returns,** check that the task's sub-tasks are ticked and that the handoff (or `.wip.md`) exists, then do Step 7.
- **If the chosen model isn't available** (plan or organization limits), fall back to the session's model and say so.

**Escalation.** If a Sonnet subagent comes back with a `[escalate]` line in the `.wip.md`, start a **new Opus subagent** to resume the same task. Give it the resume point and the `[escalate]` note, so it starts from what was tried instead of from scratch. Tell the user in one line, e.g. "T-006 was harder than planned; switching to Opus to finish it." In the handoff's Gotchas, note that the task needed Opus, so similar future tasks can be tagged `heavy`. Escalate only once per task: if Opus fails too, stop and ask the user.

When you can't choose a model (see below) and hit an `[escalate]`, tell the user: "This light task is stuck on the current model. Switching to Opus in the model picker and saying 'next task' will resume it." Then stop.

**If you can't choose a model** (claude.ai, or no subagent support): do Steps 3–6 yourself. If the hint doesn't match the model the user has selected, say so in one line before starting, then continue on the current model without waiting. Use one of these:
- Light task on Opus: "This task is light; Sonnet is enough and uses less of your limit. You can switch in the model picker, or I'll continue as is."
- Heavy task on Sonnet or Haiku: "This task is heavy (e.g. auth/data model); Opus is recommended. Switch in the model picker if you'd like."

## Step 3: Load lean context. Only this.
Read these and nothing else to start:
1. `.mvp/brief.md`
2. The task's own block in `tasks.md`. Find it with a search (e.g. grep for the `### [ ] T-xxx` headings), then read only that block, not the whole file.
3. The handoffs listed in **Context to load** (`H:T-xxx` → `.mvp/handoffs/T-xxx.md`). Only the ones listed.
4. The files listed in **Context to load**.
5. When resuming, this task's own `.mvp/handoffs/T-xxx.wip.md`, plus any files it or `git status` names.

**Do not** read:
- the original MVP doc
- other handoffs
- the whole tasks.md
- the rest of the codebase

Files this task creates or edits (including generated scaffolding and config) don't count as extra reads, and neither do searches that return only a few lines. If you really do need an existing file outside the list, read it and give a short reason ("Reading `src/lib/auth.ts`: the route imports it"). Keep the extra reads under about 3. If you need more than that, the task is under-scoped: say so, finish the current sub-task, and suggest splitting what's left.

## Step 4: Do the work, checkpoint by checkpoint
- Mark the task `[~]` in tasks.md, and set it to In Progress in the linked tool if there is one.
- On a fresh start, create `.mvp/handoffs/T-xxx.wip.md` containing only the header line (template below).
- Work through the sub-tasks in order. **After each one, in this order:**
  1. Run the quickest check that covers what you touched: typecheck, the relevant tests, or a validate or dry-run command. Save the full build for Step 5.
  2. **Append a checkpoint line** to `T-xxx.wip.md`: 1–2 lines covering what now exists, any decision made and why, and the key files touched. Assume the session could end without warning at any moment, so this line is the only record the next session will have.
  3. Check the sub-task off (`- [x]`) in tasks.md.
  4. **Commit** if the project uses git, e.g. `T-004: <sub-task>`, including the `.wip.md` and tasks.md changes. Committing each sub-task makes it easy to spot unfinished work when resuming.
     - The first time, ask the user once whether to commit after each sub-task, then record the answer in `brief#Conventions` (`Commit per sub-task: yes|no`). After that, follow the recorded answer without asking.
     - If the answer is no, suggest the commit instead of making it.
- Follow `brief#Conventions`.
- **Watch the session size.** If the conversation is getting long, don't start a new sub-task. Finish the one you're on, write its checkpoint line, and stop. Tell the user: "Stopped at a checkpoint. Say 'next task' in a fresh session to resume at sub-task N."

`T-xxx.wip.md` template:
```markdown
# WIP:T-xxx · <Title>
- [1] <what now exists> · decision: <x because y> · files: `a`, `b`
- [2] …
```

## Step 5: Verify, and capture the proof
Run the check from the task's acceptance criteria (a test, a build, a curl request, or manual steps). If it fails, fix the problem within this task. If a fix needs work that belongs to another task, write that down in the handoff and don't expand the scope.

**Capture evidence.** Save the exact command(s) you ran and the key result lines, e.g. `pnpm test → Tests 4 passed (4), exit 0`. For a manual check, write what you did and what you saw, e.g. `opened /t/ada in 2 timezones → slots shifted by 5h`. This goes into the handoff's **Evidence** line. **No evidence, no `[x]`.** If you can't produce passing evidence, leave the task `[~]`, write down what's failing in the `.wip.md`, and tell the user.

**Stuck on a light task?** If a `light` task's check still fails after two genuine fix attempts, stop fixing. Append `- [escalate] <what fails and what you tried>` to the `.wip.md`, commit, and hand back. See "Escalation" under Model routing.

## Step 6: Write the handoff (200 words max)
Create `.mvp/handoffs/T-xxx.md`. Base it on the checkpoint lines in `T-xxx.wip.md`, merged into a summary rather than copied line by line. **Facts only.** The next session reads this *instead of* this conversation and the code, so a wrong statement here is worse than a missing one.

Before saving it, do both of these checks:
- **Fact-check.** Check every file, route and claim ("removed X", "Y is gitignored") against the working tree, e.g. with `git status`, `git diff --stat <task's first commit>^`, or `ls`. Tools can re-create files you deleted, and checkpoint notes can be out of date.
- **Word count.** Count the words, excluding the Evidence line. If there are more than 200, cut them: drop anything a successor could learn from a file name, keep the gotchas, and shorten decisions to "X, because Y".
- **Secrets.** Make sure it contains no secret values (see "Never write secrets" below).

Then **delete the `.wip.md` file** and commit the deletion together with the handoff. Deleting it in the final commit is expected.

```markdown
# H:T-xxx · <Title>
_Done: <YYYY-MM-DD>_

**Built:** <1–2 sentences on what now exists and works.>
**Decisions:** <decision> — <why>. (Only non-obvious ones.)
**Files/APIs:** `path` (what it is) · `METHOD /route` (shape) · `functionName()` (purpose)
**Gotchas:** <env vars, quirks, workarounds, known limits>
**For next tasks:** <what downstream tasks must know or reuse>
**Verify:** <command or steps that prove it works>
**Evidence:** <command → key result lines, exit code> (from Step 5; required)
```

Then do the following:
- Mark the task `[x]` in tasks.md. Only do this if the handoff has an Evidence line showing a pass.
- If the task has a `Link:`, post the handoff as a comment on the linked item and set it to Done. If the connector isn't available in this session, say so and skip it; tasks.md is the source of truth.
- **Brief upkeep.** If this task changed something project-wide (stack, convention, data model, key decision), update the matching `brief.md` section in 1–2 lines and bump `_Last updated_`. If nothing changed, leave the brief untouched, including the date. Keep the brief to one page: if it grows, compress older items instead of appending.
- **Downstream context.** If this task created files that later tasks will need, but those tasks don't list them, add the files to the later tasks' "Context to load". To find those tasks, search for the `Context to load` lines instead of reading tasks.md.

- **Phase end.** If this was the last task in its phase, tell the user the phase's exit check is next (see "Phase exit check"). Don't run it in this session.

## Never write secrets
The files in `.mvp/` are committed to git and often pushed to GitHub, and handoffs may be posted to a PM tool. **Never write secret values** in the brief, tasks.md, `.wip.md`, handoffs, or PM tool comments. That covers API keys, tokens, passwords, connection strings with credentials, webhook secrets and private URLs.
- Refer to secrets by **name only**: "needs `STRIPE_SECRET_KEY` in `.env`" is fine; its value is not.
- Before each commit, search the staged `.mvp/` changes for likely secrets, e.g. `sk_live`, `sk_test`, `whsec_`, `password=`, `token=`, `postgres://user:pass@`, or long random strings. If you find one, remove it before committing.
- If a secret was already committed, tell the user right away. It must be rotated; deleting it from the file isn't enough.

## Phase exit check
Each phase has an **Exit** criterion, e.g. "a tutor can sign in and land on `/dashboard`". Passing each task's own check doesn't prove that the pieces work together, so the exit check runs as its own short session.
- **When:** in Step 2, if every task in a phase is `[x]` but the phase has no `**Exit check:** passed` line, do the exit check **before** starting any task in the next phase.
- **How:** load `brief.md`, the phase block and the phase's handoffs (only their Verify and Evidence lines). Run the full test suite and the build, then walk through the exit criterion end to end, the way a user would.
- **Pass:** add `**Exit check:** passed <YYYY-MM-DD> · <evidence>` under the phase heading in tasks.md, commit, and stop.
- **Fail:** don't fix it inline. Add a fix task to the end of that phase, e.g. `T-008a · Fix: <what broke> · S`, with its own Model hint, Depends on, Context to load and sub-tasks. Commit, and tell the user it's the next task. The exit check runs again after it.

## Step 7: Stop
Report in about 4 lines:
- what was done
- the verification result
- the handoff path
- the next unblocked task (ID and title)

**Don't start the next task automatically.** Tell the user: "Say 'next task' in a fresh session to continue." A fresh session keeps the context lean. Continuing in this one carries all of this conversation along with it.
