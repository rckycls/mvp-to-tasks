# Other tools (Asana, GitHub Issues, ClickUp, Notion, Monday, etc.)

1. **Inspect the tools.** Look at the connector's tool list and work out how to:
   - pick a workspace, project or repo
   - create a container for each phase
   - create items and child items
   - add comments
   - link dependencies
2. **Map the plan onto the tool's closest concepts:**

| Plan | Look for | Examples |
|---|---|---|
| MVP | project / repo / database / board | Asana project, GitHub repo, Notion database |
| Phase | section / milestone / epic / group / select property | Asana section, GitHub milestone, Notion "Phase" property |
| Task | task / issue / page / item | |
| Sub-task | subtask / child issue / checklist / task list | GitHub task-list checkboxes in the issue body, Asana subtasks |
| Size | custom field / label / tag | |
| Model hint | a line in the description, or a label or tag | |
| Depends on | dependency field / "blocked by" / a line in the description | |

3. **If there is no child-item concept**, put the sub-tasks as a markdown checklist in the task description.
4. **Tell the user your mapping** in the preview before you create anything.
5. **Always keep the "T-xxx · " prefix** in titles, so the `next-task` skill can match items to tasks.md.

If you can't find the tool's connector, fall back to tasks.md plus a CSV generated with `node <skill dir>/scripts/export-plan.mjs .mvp generic`, and mention that most tools can import CSV.
