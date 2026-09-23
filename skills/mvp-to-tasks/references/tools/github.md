# GitHub Issues and Projects (kanban)

There are two ways to create the items:
- **The GitHub MCP server.** Most agents support it, and in Claude Code it's also available as a plugin. Look for tools that create issues and milestones, add sub-issues, and add items to projects.
- **The `gh` CLI**, through a generated script.

GitHub has **no CSV import** for issues or Projects.

## Mapping
| Plan | GitHub |
|---|---|
| MVP | **Repository**, plus optionally a **Project** (board view = kanban). Ask which repo, and whether to add the issues to a project. |
| Phase | **Milestone** named "Phase N: <Name>". The description holds the goal and exit criterion. |
| Task | **Issue** titled "T-001 · Title", in the phase's milestone |
| Sub-task | A **checklist** in the issue body (default), or real **sub-issues** if the user wants them. GitHub allows up to 100 sub-issues per parent and 8 levels. |
| Size | Label `size-S` / `size-M` |
| Model hint | A line in the body, plus the label `model-heavy` on heavy tasks |
| Depends on | A line in the body ("Depends on: T-006, T-007"). GitHub's issue dependencies can be set in the UI later. |
| Status | The Project's Status field (Todo / In Progress / Done). Closed issues show as Done. |

**Rules GitHub enforces:**
- **Labels and milestones must already exist** before `gh issue create --label/--milestone` can use them.
- Adding issues to a Project needs the `project` scope: `gh auth refresh -s project`.

## Fallback: gh CLI script
1. Generate it: `node <skill dir>/scripts/export-plan.mjs .mvp github [--sub-issues] [--project "Project title"] > .mvp/plan-github.sh`
   - The script creates the labels (`--force`, so reruns are safe) and the milestones (skipping ones that exist), then the issues in plan order. With `--sub-issues`, it creates each step as a sub-issue using `gh issue create --parent`. Finished `[x]` tasks are created and then closed.
   - It writes `.mvp/github-map.txt` with one line per task: `T-001 <issue URL>`.
2. Show the user what it will create (milestones, issues, sub-issue count), and **wait for a yes**. Issues on a public repo are public.
3. The user runs it from inside the repo, after `gh auth login`: `bash .mvp/plan-github.sh`. On Windows, use Git Bash or WSL.
4. Afterwards, copy each URL from `github-map.txt` into that task's `Link:` field in tasks.md, so next-task can close issues and comment on them.

**Rerunning** the script creates duplicate issues. It's meant to run once per plan. To add tasks later, create only those issues.

## Order of calls (MCP)
1. Pick the repo (and project, if any).
2. Create the labels and milestones, then the issues, then the sub-issues (if wanted). Save the URLs.
3. Add the issues to the project, if any.
4. Write the URLs back into tasks.md.
