# MVP to Tasks

### Build your MVP on Claude Pro without hitting the usage limit mid-task.

Claude Pro gives you a limited amount of usage every 5 hours. Build anything real and you'll hit that limit halfway through a feature, then spend the next session getting Claude back up to speed.

**MVP to Tasks plans your build around that limit.** It splits your idea into tasks that each fit in one session. Each task saves its progress as it goes, so a cut-off costs you minutes, not the whole session. Easy tasks run on a cheaper model, so your usage lasts longer.

```bash
npx skills add https://github.com/rckycls/mvp-to-tasks --skill '*'
```

| | Without it | With it |
|---|---|---|
| **Hit the limit mid-task** | The next chat doesn't know where you stopped | Say "next task". It resumes from the last finished step. |
| **Starting a new chat** | Re-paste the spec; Claude re-reads the codebase | It reads a one-page summary plus the notes it needs |
| **Easy tasks** ("add a settings page") | Run on the top model | Run on Sonnet; Opus is saved for the hard parts |
| **Planning** | One huge to-do list | Phases → tasks sized to about 2–4 per usage window |

It comes as two skills that work together:

| Skill | What you say | What happens |
|---|---|---|
| **mvp-to-tasks** | "Break down my MVP" | Claude reads your idea and turns it into a plan: **phases → tasks → small steps**. |
| **next-task** | "Next task" | Claude builds the next piece of the plan, saves its progress, and leaves a note for next time. |

---

## The problem this solves

If you've built something bigger than a toy on the Pro plan, you've probably hit these:

- **You run out of usage partway through a task.** Big tasks get cut off halfway, and the next chat has no idea where you stopped.
- **You keep re-explaining your project.** Every new chat starts from zero, so you paste the spec again, Claude re-reads the codebase, and a big chunk of your usage goes on catching up.
- **Everything runs on the most expensive model,** even the easy stuff like "add a settings page".

## How it fixes them

**1. Tasks sized to fit your usage limit.**
Every task is kept small enough to finish comfortably in one session, typically 2–4 tasks per 5-hour window on Pro. Big tasks get split before they ever reach you.

**2. Save points inside every task.**
Each task is broken into a few small steps. After each step, Claude ticks it off and writes a one-line note. If your limit hits mid-task, just start a new chat and say "next task". Claude reads the notes, checks what was left half-done, and carries on.

**3. A short memory instead of re-reading everything.**
The plan keeps a **one-page project summary** plus a **short note from each finished task** ("built the login, here's how it works, watch out for X"). A new session reads only the summary and the notes it needs, not your whole spec, codebase or old chats.

**4. The right model for each task.**
Every task is labeled **light** or **heavy**. In Claude Code, light tasks run on Sonnet and heavy ones (login, payments, database design) run on Opus, so your usage goes further. On claude.ai, Claude tells you which model to pick.

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

Claude will:
1. Ask a few questions, such as which plan you're on and whether you want a file, tickets in your project tool, or both.
2. Show you a one-page summary of your project and wait for your OK.
3. Show you the full plan to review and edit.
4. Save the plan, create the tickets, or both.

**Step 2: Build it (one task per chat)**

> **You:** Next task

Claude picks the next task, builds it, tests it, writes a short note for next time, and stops.
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

The plan can go straight into **Linear, Jira, Trello**, or most other tools Claude can connect to. Phases become milestones or epics, tasks become tickets, and steps become sub-tasks. Claude always shows you what it's about to create and waits for your OK.

**To connect your tool:**
- **claude.ai:** go to **Settings → Connectors** and add it.
- **Claude Code:** add the tool's MCP server.

No tool? You still get a `tasks.md` file, plus a CSV you can import later.

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

## Good to know

- **Task sizes are estimates.** How much fits in a usage window depends on your project and how much debugging happens. Tasks are sized with plenty of margin, and if one does get cut off, you just resume.
- **On Max plans?** Tell Claude when it asks, and it'll make tasks a bit bigger.
- **Automatic model switching only works in Claude Code.** On other apps, every task runs on whichever model you've selected.
- **Nothing gets created in your project tool without your OK.**

## License

MIT
