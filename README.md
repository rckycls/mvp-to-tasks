# MVP to Tasks

### Build your MVP with an AI coding agent without hitting your usage limit mid-task.

Works with **Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot** and [any agent that supports skills](#works-with-other-agents).

Every AI coding plan has a usage limit, whether it's Claude's 5-hour windows or the rate and request limits on Codex, Cursor, Gemini and the rest. Build anything real and you'll hit yours halfway through a feature, then spend the next session getting the agent back up to speed.

**MVP to Tasks plans your build around that limit.** It splits your idea into tasks that each fit in one session. Each task saves its progress as it goes, so a cut-off costs you minutes, not the whole session. Easy tasks run on a cheaper model, so your usage lasts longer.

```bash
npx skills add https://github.com/rckycls/mvp-to-tasks --skill '*'
```

| | Without it | With it |
|---|---|---|
| **Hit the limit mid-task** | The next chat doesn't know where you stopped | Say "next task". It resumes from the last finished step. |
| **Starting a new chat** | Re-paste the spec; the agent re-reads the codebase | It reads a one-page summary plus the notes it needs |
| **Easy tasks** ("add a settings page") | Run on the top model | Run on a faster, cheaper model; your strongest model is saved for the hard parts |
| **Planning** | One huge to-do list | Phases → tasks, each sized to fit one session |

It comes as two skills that work together:

| Skill | What you say | What happens |
|---|---|---|
| **mvp-to-tasks** | "Break down my MVP" | Your agent reads your idea and turns it into a plan: **phases → tasks → small steps**. |
| **next-task** | "Next task" | Your agent builds the next piece of the plan, saves its progress, and leaves a note for next time. |

---

## The problem this solves

If you've built something bigger than a toy with an AI coding agent, you've probably hit these:

- **You run out of usage partway through a task.** Big tasks get cut off halfway, and the next chat has no idea where you stopped.
- **You keep re-explaining your project.** Every new chat starts from zero, so you paste the spec again, the agent re-reads the codebase, and a big chunk of your usage goes on catching up.
- **Everything runs on the most expensive model,** even the easy stuff like "add a settings page".

## How it fixes them

**1. Tasks sized to fit your usage limit.**
Every task is kept small enough to finish comfortably in one session. Big tasks get split before they ever reach you. When you plan, you say which tool and plan you use. Sizing is tuned for Claude Pro (about 2–4 tasks per 5-hour window), and other tools get a cautious default.

**2. Save points inside every task.**
Each task is broken into a few small steps. After each step, the agent ticks it off and writes a one-line note. If your limit hits mid-task, just start a new chat and say "next task". The agent reads the notes, checks what was left half-done, and carries on.

**3. A short memory instead of re-reading everything.**
The plan keeps a **one-page project summary** plus a **short note from each finished task** ("built the login, here's how it works, watch out for X"). A new session reads only the summary and the notes it needs, not your whole spec, codebase or old chats.

**4. The right model for each task.**
Every task is labeled **light** or **heavy**. Light tasks run on a faster, cheaper model, and heavy ones (login, payments, database design) run on your strongest model, so your usage goes further. Agents that can run subagents on a chosen model switch automatically; in Claude Code, for example, light tasks run on Sonnet and heavy ones on Opus. Other agents tell you which model to pick.

---

## Install

**Easiest: one command** (works with Claude Code, Codex, Cursor, Gemini and more)

```bash
npx skills add https://github.com/rckycls/mvp-to-tasks --skill '*'
```

Add `-g` at the end to install for all your projects. Needs [Node.js](https://nodejs.org).

<details>
<summary><b>Other ways to install</b></summary>

**As a Claude Code plugin**
```
/plugin marketplace add rckycls/mvp-to-tasks
/plugin install mvp-to-tasks@mvp-to-tasks
```

**On claude.ai or the Claude desktop app**
1. Download `mvp-to-tasks.zip` and `next-task.zip` from the [Releases](../../releases) page.
2. Go to **Settings → Capabilities → Skills**, click **Upload skill**, and upload both zips.
3. Make sure **Code execution and file creation** is turned on.

</details>

---

## How to use it

**Step 1: Make the plan (once)**

> **You:** Break down my MVP. *(then paste your spec, describe your idea, or run it inside your project folder)*

Your agent will:
1. Ask a few questions, such as which AI tool and plan you're on and whether you want a file, tickets in your project tool, or both.
2. Show you a one-page summary of your project and wait for your OK.
3. Show you the full plan to review and edit.
4. Save the plan, create the tickets, or both.

**Step 2: Build it (one task per chat)**

> **You:** Next task

Your agent picks the next task, builds it, tests it, writes a short note for next time, and stops.
**Start a fresh chat for each task.** This keeps every session small and cheap.

That's it. Repeat step 2 until your MVP is done.

---

## What a plan looks like

Here's one task from an example plan for a tutor-booking app:

```markdown
### [ ] T-008 · Reserve a slot (pending booking) · M
- Goal: Selecting a slot creates a pending booking without allowing double-booking.
- Depends on: T-006, T-007
- Model: heavy
- Acceptance: two students booking the same slot at the same moment → only one succeeds.
- Context to load: project summary · notes from T-006, T-007 · src/lib/slots.ts
- Steps:
  - [ ] Server action that re-checks the slot and creates the booking
  - [ ] Treat unpaid bookings older than 30 minutes as expired
  - [ ] Booking form with a "slot just taken" message
  - [ ] Verify with a test + write the note for next time
```

See the full example in [`skills/mvp-to-tasks/examples/tutorbook`](skills/mvp-to-tasks/examples/tutorbook/).

---

## Works with your project tool (optional)

The plan can go straight into **Linear, Jira, Trello, GitHub Issues/Projects**, or most other tools your agent can connect to. Phases become milestones or epics, tasks become tickets, and steps become sub-tasks. Your agent always shows you what it's about to create and waits for your OK.

**No connection? You get an import file built to each tool's rules:**

| Tool | What you get | How to import |
|---|---|---|
| Jira | CSV with epics → stories → subtasks | Settings → System → External system import → CSV |
| Linear | CSV in Linear's export format | `npx @linear/import` → "Linear (CSV export)" |
| GitHub | A `gh` script that creates milestones, issues, sub-issues, and optionally adds them to a Project board | `bash .mvp/plan-github.sh` |
| Trello | Paste-ready card lists | Paste into a list; each line becomes a card |
| Anything else | Generic CSV with parent IDs | Your tool's CSV import |

**To connect your tool:**
- **claude.ai:** go to **Settings → Connectors** and add it.
- **Claude Code, Codex, Cursor, Gemini CLI and other coding agents:** add the tool's MCP server.

No tool at all? `tasks.md` works on its own.

---

## Files it adds to your project

Everything lives in one folder, `.mvp/`, at the root of your project:

| File | What it is |
|---|---|
| `brief.md` | One-page project summary that every session reads |
| `tasks.md` | The plan, with checkboxes that fill in as you go |
| `handoffs/T-001.md` … | A short note from each finished task, which later tasks read |
| `handoffs/T-005.wip.md` | Progress notes while a task is in progress (so nothing's lost if you're cut off) |

They're plain text, so you can read and edit them yourself.

---

## Works with other agents

These are standard [Agent Skills](https://agentskills.io): plain folders with a `SKILL.md`. They work in any agent that supports skills. Your plan is plain files and git, so you can even switch agents partway through a build.

| Feature | Claude Code | Codex, Cursor, Gemini CLI, Copilot, etc. | claude.ai / desktop |
|---|---|---|---|
| Plan: phases → tasks → steps | ✅ | ✅ | ✅ (files to download) |
| Save points, resume after a cut-off | ✅ | ✅ | ✅ |
| Handoff notes, proof before "done", phase checks | ✅ | ✅ | ✅ |
| Linear / Jira / Trello | ✅ via MCP | ✅ via MCP, where supported | ✅ via Connectors |
| Light/heavy model routing | ✅ automatic | Recommends a model; you switch | Recommends a model; you switch |
| Task sizing | Tuned for Claude Pro/Max | Uses the cautious Pro profile | Tuned for Claude Pro/Max |

The plan checker needs [Node.js](https://nodejs.org). Without it, the agent checks the same rules by hand.

---

## Good to know

- **Task sizes are estimates.** How much fits in a usage window depends on your project and how much debugging happens. Tasks are sized with plenty of margin, and if one does get cut off, you just resume.
- **On a bigger plan?** Claude Max users get slightly bigger tasks. Other tools use the cautious default for now, so tasks stay small everywhere else.
- **Automatic model switching needs subagent support** (Claude Code today). Elsewhere, every task runs on the model you've selected, and the agent tells you when a different one would suit it better.
- **Nothing gets created in your project tool without your OK.**

## License

MIT
