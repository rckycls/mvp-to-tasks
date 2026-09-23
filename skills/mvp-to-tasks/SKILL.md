---
name: mvp-to-tasks
description: Turns an MVP (a written spec/PRD, a rough idea, or an existing codebase) into phases, then tasks and sub-tasks, each sized so Claude can finish it in one session within a Pro plan's 5-hour usage window. Writes a lean project brief plus tasks.md, creates the items directly in Linear, Jira, Trello or another connected PM tool, or does both. Use when the user says things like "break down my MVP", "turn this MVP into tasks", "plan phases for my product", "make a tasks.md from this idea", or "create Linear/Jira/Trello tickets from my spec".
---

# MVP → Phases → Tasks

Turn an MVP into a build plan that someone can work through **one Claude session at a time** without running into usage limits. Each task has to fit inside a usage window, and it also has to carry just enough context that the next session can start without re-reading everything.

Follow these steps in order. Do not skip the two confirmation gates (step 2 and step 5).

## Step 0: Check for an existing plan

Before anything else, check whether `.mvp/tasks.md` already exists (in the tool too, if the user says their plan lives there). If it exists and still has unfinished tasks (`[ ]` or `[~]`), **stop and ask** before doing anything else. Give the user three options:
1. **Keep building.** Suggest "next task" instead; don't re-plan.
2. **Re-plan what's left.** Keep every `[x]` task, its ID and its handoff exactly as they are, and re-plan only the unfinished tasks. New tasks continue the ID sequence. Later tasks that are still valid keep their IDs.
3. **Start over.** Move the old `.mvp/` to `.mvp/archive-<YYYY-MM-DD>/` first. **Never delete a plan or its handoffs.**

If every task in the existing plan is `[x]`, say the plan is complete and ask whether this is a new MVP or v2 of the same product. For v2, continue the ID sequence and keep the old brief as the base for the new one.

## Step 1: Intake

Read `references/intake.md`, then work out which input you have. Several can apply at once.

| Input | What to do |
|---|---|
| Written MVP doc (pasted, .md, .pdf, .docx) | Read all of it. List any gaps that would block decomposition. |
| Rough idea | Ask **at most 5** targeted clarifying questions in a single message, then continue. |
| Existing codebase | Scan the structure, README, routes, models, schema and TODOs. Classify each feature as **built**, **partial** or **missing**. |

Always ask these two questions as well. They **don't count toward the 5**, and they go in the same message as any clarifying questions:
- **Which Claude plan are you on?** (Pro is the default.)
- **Output:** `tasks.md`, create in your PM tool, or both? If a tool, which one?

Once you know the plan, read `references/plan-budgets.md` and note the thresholds for that profile. You'll need them in step 4.

## Step 2: Understanding summary → gate

Write the summary using the `brief.md` template in `references/file-formats.md`. Use its headings exactly: Goal, Users, Scope (In/Out), Stack, Conventions, Data model, Key decisions, Assumptions. Keep it to **one page or less** (about 450 words).

Show it **in chat** and ask the user to confirm or correct it. **Do not decompose until they confirm.** Don't write any files yet; step 5 writes them.

The confirmed version becomes `.mvp/brief.md`. It is the *only* project-wide context that future task sessions load, so everything in it has to be worth loading every time.

Two rules for the brief:
- **No unresolved placeholders.** If something is still `TBD`, `TODO` or `???`, either ask the user or pick a sensible default and record it under Assumptions. Unresolved answers turn into guesses later, and the checker rejects them.
- **No secrets.** Never paste API keys, passwords or tokens into the brief or the plan, even if the user's spec contains them. `.mvp/` gets committed to git. Refer to secrets by environment variable name only, e.g. `STRIPE_SECRET_KEY`.

## Step 3: Phases

Read `references/decomposition.md`. Produce 3–6 phases in dependency order. Each phase gets:
- a goal (one sentence)
- an exit criterion (something observable)
- dependencies on earlier phases

For a codebase input, leave out work that is already built. Partial work becomes a "finish X" task.

## Step 4: Tasks and sub-tasks (sized to the usage window)

Split each phase into tasks, then **run every task through the sizing checklist** in `references/decomposition.md`, using the thresholds from the user's plan profile. Any task that fails a check gets split. Sizes are **S or M only**; anything that would be L gets split before it is written down.

Every task must have:
- An **ID** (`T-001`, …), title, goal, and **1–3 acceptance criteria**, separated by semicolons. Needing more than 3 is a sign the task should be split.
- A **size** (S/M) and **dependencies** (task IDs).
- A **Model** hint, `light` or `heavy`, following the rules in `decomposition.md`. Most tasks should be `light`.
- **Sub-tasks as checkpoints**, 2–6 per task. Each one is small enough to commit on its own, so a task cut off by the usage limit can resume from the last checked sub-task.
- A **Context to load** list, which is exactly what a fresh session needs:
  - the `brief.md` sections that matter
  - the handoffs of dependency tasks (by ID)
  - the specific files or directories to open (existing ones, or ones created by dependency tasks)

  Keep the list short. If it needs more than 3 dependency handoffs or about 8 files, the task is too big, so split it.

## Step 5: Review → gate

**Write, then validate.** This is the only place the plan files get written. Step 0 has already made sure you won't overwrite an unfinished plan.
1. Write `.mvp/brief.md` and `.mvp/tasks.md` (the tasks.md header can leave the window estimate as `~?`).
2. Run `node <this skill's dir>/scripts/check-plan.mjs .mvp <pro|max5|max20>`. It checks:
   - size labels and models
   - acceptance criteria (1–3 per task)
   - sub-task counts and the final "Verify" step
   - unresolved placeholders (`TBD`, `TODO`, `???`) and likely secrets in the brief or the plan
   - handoff limits, and handoffs missing from "Depends on"
   - dependency order
   - that the header's window range matches the script's estimate

   It also prints the estimate.
3. Copy the estimate into the tasks.md header as a range (e.g. 8.1 → "~8–9").
4. Fix everything the script reports and run it again until it passes.

The script **can't** judge sizing checks 2, 3 and 5 (files changed, new subsystems, files read), and it counts a directory entry as a single file. Those checks stay your responsibility from step 4.

If `node` isn't installed, or the command fails for environment reasons (e.g. a path that's too long for one shell), try another shell once. If it still fails, check the same rules by hand.

If you're unsure about the format, `examples/tutorbook/` contains a complete plan that passes.

Show the plan as an outline with phases, then tasks (ID, title, size, model, deps), then sub-tasks. Also show the totals: the number of tasks, the light/heavy split, and a rough estimate of how many usage windows the plan needs (from the plan profile). Let the user edit, merge, split or reorder. Re-run the sizing checklist on anything they change.

## Step 6: Output

Use the format and destination the user picked in step 1.

### tasks.md
Both files already exist from step 5. Apply any edits the user asked for during review (then re-run the checker), and create the empty `.mvp/handoffs/` directory with a `.gitkeep` file.

If you can't write to a filesystem (for example in claude.ai chat), create `brief.md` and `tasks.md` as downloadable files, and tell the user to put them in a `.mvp/` folder at their project root.

### Direct to PM tool
1. **Detect the tool.** Check which PM connector/MCP tools are available.
   - Load the matching guide: `references/tools/linear.md`, `jira.md`, `trello.md`, or `generic.md` for any other tool.
   - If no PM tool is connected, say so and explain how to connect one: in claude.ai, **Settings → Connectors**; in Claude Code, `claude mcp add` or the tool's plugin. Then fall back to tasks.md plus the importable CSV described in the tool guide.
2. **Pick the destination.** List the teams, projects or boards from the tool, and ask the user where the items should go.
3. **Preview → gate.** Show exactly what will be created: containers, items, sub-items and fields. **Create nothing until the user explicitly says yes.**
4. **Create the items in this order:**
   1. phase containers
   2. tasks, with the "Context to load" list, the Model hint and acceptance criteria in each description
   3. sub-tasks
   4. dependency links, where the tool supports them
5. **Report.** Give links to each phase and task. If any creation failed, list the failures and offer to retry just those.

### Both
Write tasks.md first, then create the items in the tool. After that, add each item's URL to its task line in `tasks.md` (the `Link:` field). This way `next-task` can sync status to the tool later.

## Finish

Keep this short. The user already saw the counts in step 5, so don't repeat them. End with:
- where the plan lives (file paths and/or tool links)
- this instruction: **"Start each work session with 'next task' in a fresh chat. It uses the `next-task` skill (included with this plugin; on claude.ai, upload `next-task.zip` too) and loads only the brief, the relevant handoffs and the listed files, so each session stays small."**
