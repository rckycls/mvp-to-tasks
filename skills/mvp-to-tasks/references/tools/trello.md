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

## CSV fallback
Trello has no native CSV import on free plans. Offer instead:
- the tasks.md file, or
- a Power-Up or third-party import, or
- creating the cards manually from the preview.
