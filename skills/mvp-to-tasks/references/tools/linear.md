# Linear

Connect it through claude.ai **Settings → Connectors → Linear**, or with the Linear MCP server in Claude Code. Tool names vary by connector version. Look for tools that list teams, projects, milestones, labels and issues, and tools that save or create issues, milestones and comments.

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
Linear imports CSV under **Settings → Import/Export**. Map ID to the title prefix, Phase to a label, and Parent ID to parent.
