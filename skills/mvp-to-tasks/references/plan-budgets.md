# Plan budgets

Claude's paid plans limit usage over a rolling **5-hour window**. How much work fits in one window depends on the model, the codebase size, how much gets read, and how many debugging loops happen, so none of this can be measured precisely ahead of time. These profiles use **proxies** that usually keep a task well inside a window. When you're unsure, size smaller.

Tell the user that these are guidelines. If a task hits the limit anyway, it can resume from its last checked sub-task.

| Profile | Files changed | Files read | Dep. handoffs | Subsystems | Target tasks per window |
|---|---|---|---|---|---|
| **Pro** (default) | ≤ 8 | ≤ 8 | ≤ 3 | ≤ 1 | 2–4 (about 2 heavy M, up to 4 light S) |
| **Max 5x** | ≤ 12 | ≤ 12 | ≤ 4 | ≤ 1 | 4–6 |
| **Max 20x** | ≤ 15 | ≤ 15 | ≤ 5 | ≤ 2 | many |
| **Unknown / API / Team** | Use Pro | | | | |

Keep tasks small even on the Max plans. Smaller tasks produce better handoffs and clearer history, and they are easier to review. The larger profiles mainly allow slightly bigger vertical slices and fewer spike tasks.

## Estimating windows for the plan
Heavy tasks run on Opus, which uses up the limit faster than Sonnet, so weight each task by both its size and its model (Pro):

| | light (Sonnet) | heavy (Opus) |
|---|---|---|
| S | 0.2 | 0.35 |
| M | 0.3 | 0.5 |

`windows ≈ sum of weights × 1.2`, where the ×1.2 covers debugging and rework. Give the result as a range: round down and round up. For Max 5x, divide the result by about 2; for Max 20x, the limit rarely matters, so give the number of sessions instead.

Always present this as a rough estimate ("about 8–10 Pro windows"), never a promise.

## Tips to put in the tasks.md header note (the blockquote under the title)
- Start each session fresh with "next task". Don't carry one long conversation across tasks.
- Plan and review on a cheaper or faster model if you like, and switch to a stronger one for tricky tasks.
- If a session is getting long, finish the current sub-task, write the handoff, and stop.
