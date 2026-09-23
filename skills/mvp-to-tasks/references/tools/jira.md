# Jira

Connect it through your app's connectors (claude.ai: **Settings → Connectors → Atlassian**) or by adding the Atlassian MCP server to your coding agent (Claude Code, Codex, Cursor, Gemini CLI and others). Look for tools that list projects and issue types, create or edit issues, link issues, and add comments.

## Mapping
| Plan | Jira |
|---|---|
| MVP | **Project**. Ask the user which one; do not create projects. |
| Phase | **Epic** named "Phase N: <Name>". The description holds the goal and exit criterion. |
| Task | **Story** or **Task** (whichever types the project has), with the parent/epic link set to the phase epic. Prefix the summary with the ID: "T-001 · Title". |
| Sub-task | **Sub-task** issue type with its parent set to the task. |
| Size S / M | Story points 1 / 2 if the field exists. Otherwise use labels `size-S` / `size-M` (Jira labels can't contain spaces). |
| Depends on | Issue link "is blocked by". |
| Model hint | Line in the description, plus the label `model-heavy` on heavy tasks. |

Before creating anything, check which issue types the project really has, because team-managed and company-managed projects use different names. Adapt the mapping to what you find: if there are no epics, use a label `phase-1` and so on.

## Description
Use the same content as the Linear template (goal, acceptance criteria, "Context to load"). Jira accepts markdown-ish text through most connectors. Keep the formatting simple.

## Order of calls
1. Pick the project, then fetch its issue types and fields.
2. Create the epics, then the stories/tasks, then the sub-tasks. Save the issue keys and URLs.
3. Create the "blocks" links.
4. Write the URLs back into tasks.md if it exists.

## CSV fallback
1. Generate the file: `node <skill dir>/scripts/export-plan.mjs .mvp jira > .mvp/plan-jira.csv`
   - Ask whether the project calls its types **Story** or **Task**, and **Subtask** or **Sub-task**. Company-managed projects often use `Sub-task`. Pass `--task-type` and `--subtask-type` to match. A type name that doesn't match causes a "work type" error on import.
2. Tell the user how to import it. Jira's hierarchy rules only work in the **CSV external system import**: **Settings (⚙️) → System → External system import → CSV**. The quick "Import work items" option in a project **can't** build parent/child links.
3. On the field-mapping screen, map `Work item ID` → **Work item ID**, `Work type` → **Work type**, `Parent` → **Parent**, `Summary` → **Summary**, `Description` → **Description** and `Labels` → **Labels**. All three of ID, Work type and Parent must be mapped, or Jira shows *"Missing work types"*.
4. Dependencies ("Depends on") are listed in each description. They aren't created as Jira links.
