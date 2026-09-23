# Trello

Connect it through a Trello connector or MCP server if the user has one. Look for tools that list boards and lists and that create cards, checklists, labels and comments.

## Mapping
Trello has no hierarchy, so ask the user which layout they want:

**Layout A: status lists (recommended for doing the work)**
| Plan | Trello |
|---|---|
| MVP | **Board**. Use an existing one or create a new one; ask the user. |
| Status | Lists: `To do`, `In progress`, `Done` |
| Phase | **Label** "P1 Foundation", "P2 Core loop", … (a color per phase) |
| Task | **Card** named "T-001 · Title", placed in `To do` in task order |
| Sub-task | **Checklist** named "Checkpoints" on the card |
| Size | Label `S` / `M` |
| Model hint | Line in the card description, plus the label `heavy` on heavy tasks |
| Depends on | A line in the card description: "Blocked by: T-001 (link)" |

**Layout B: phase lists (recommended for seeing the roadmap)**
Create one list per phase ("Phase 1: Foundation"). Cards go in the list for their phase. Show status with a `Done` label, or by moving finished cards to a `Done` list.

## Description
Use the goal, the acceptance criteria as a second checklist or as text, and "Context to load".

## Order of calls
1. Pick or create the board, then create the lists and labels.
2. Create the cards in task order, then add the checklists.
3. Write the card URLs back into tasks.md if it exists.

## Fallback (no connector)
Trello has **no native CSV import**. Its built-in import is copy-paste: pasting multi-line text into a list creates one card per line.

1. Generate paste-ready text: `node <skill dir>/scripts/export-plan.mjs .mvp trello > .mvp/plan-trello.txt`
2. The user creates one list per phase (Layout B), clicks **Add a card**, pastes that phase's block, and confirms **Create N cards**.
3. This only creates card **titles** (`T-xxx · Title [size, heavy]`). Descriptions and checklists stay in tasks.md, which is fine because next-task reads tasks.md, not Trello.
4. For full cards with descriptions, checklists and labels, the options are:
   - a Trello MCP connector (create the items directly, as above), or
   - an import Power-Up such as "Import to Trello by Blue Cat" or Excelefy, using the generic CSV (`export-plan.mjs .mvp generic`). These are third-party, so the user maps the columns in the Power-Up.
