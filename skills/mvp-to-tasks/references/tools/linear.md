# Linear

Connect it through your app's connectors (claude.ai: **Settings → Connectors → Linear**) or by adding the Linear MCP server to your coding agent (Claude Code, Codex, Cursor, Gemini CLI and others). Tool names vary by connector version. Look for tools that list teams, projects, milestones, labels and issues, and tools that save or create issues, milestones and comments.

## Mapping
| Plan | Linear |
|---|---|
| MVP | **Project**. Create a new one or use an existing one; ask the user. |
| Phase | **Project milestone** named "Phase N: <Name>". The description holds the goal and exit criterion. |
| Task | **Issue** in the project, assigned to its milestone. Prefix the title with the ID: "T-001 · Title". |
| Sub-task | **Sub-issue**: set the parent to the task's issue. |
| Size S / M | Estimate 1 / 2 if the team uses estimates. Otherwise use a label `size:S` / `size:M`. |
| Depends on | "Blocked by" relation, if the connector supports it. Otherwise list it in the description. |
| Model hint | In the description (`**Model:** light`). Optionally also add a label `model:heavy` for heavy tasks. |
| Labels | Reuse existing team labels when they match (frontend, backend…). Only create new labels if the user agrees. |

## Issue description template
```markdown
**Goal:** …

**Acceptance criteria**
- [ ] …

**Context to load:** brief#…, H:T-00x, files: `…`
**Model:** light | heavy

_Part of the MVP plan (mvp-to-tasks). Handoff notes are posted as comments when the issue is done._
```

## Order of calls
1. List the teams, then ask the user which team to use. List the projects and ask whether to use an existing one or create a new one.
2. Create the milestones, then the issues (tasks), then the sub-issues. Save the returned URLs.
3. Add the blocking relations.
4. If tasks.md exists, write each URL into that task's `Link:` field.

## CSV fallback
Linear's in-app importers only cover other tools (Jira, Asana, GitHub, Shortcut). There's **no generic CSV upload**. A CSV goes through Linear's **command-line importer** instead, which accepts files in Linear's own export format.

1. Generate the file: `node <skill dir>/scripts/export-plan.mjs .mvp linear > .mvp/plan-linear.csv`
   - It has these columns: `Title, Description, Priority, Estimate, Labels, Status`.
   - Labels are joined with `", "` (comma space), which is how the importer splits them. Priority is text (`No priority`). Status must match a workflow state name in the team (`Todo` and `Done` by default).
2. The user runs **`npx @linear/import`** and chooses **"Linear (CSV export)"**, the CSV path, and the target team. It asks for a **Linear API key** (Settings → Security & access → Personal API keys). The user enters it themselves; never ask for it or type it in.
3. Each task becomes an issue titled `T-xxx · Title`, with the phase as a label and the steps as a checklist in the description.
4. **Limits:** this importer ignores parent links and doesn't create projects or milestones. For milestones per phase and real sub-issues, use the Linear MCP connector and create the items directly instead. That's the better option whenever it's available.
