# Intake

The goal of intake is to understand the MVP well enough to decompose it without asking the user anything more later. Ask all of your questions at once, in a single message.

## Written MVP doc
- Read the whole document before you summarize anything.
- Pull out the goal, target users, features (tag each one must-have or nice-to-have), constraints (deadline, budget, team size), stack and integrations.
- Treat "nice-to-have" and "v2" items as **out of scope** unless the user says otherwise.
- Only ask about a gap when it changes the decomposition, e.g. the platform (web, mobile or both), authentication, payments, or the data model. Keep it to 5 questions at most.

## Rough idea
If the user already answered any of these, skip that one. Otherwise ask up to 5 of them, in this priority order:
1. Who is it for, and what is the one thing they must be able to do?
2. What are the 3–5 core features for the first usable version?
3. What's the platform (web, mobile, desktop, API), and do you already have a preferred stack?
4. Does it need accounts/login, payments, or third-party integrations?
5. Is there a deadline, and how many people are building it (or is it just you and Claude)?

If an answer is still missing, pick a sensible default, **record it as an assumption** in the brief, and keep going.

## Existing codebase
Keep the scan lean. Its purpose is to classify features, not to understand every line.
- Read the README, the package manifest (package.json, pyproject, go.mod and so on), the top-level directory tree, and the route, page and API definitions.
- Read the schema, migrations or models, the env example, and any TODO or FIXME comments.
- Build a table with the columns feature | status (built / partial / missing) | evidence (file path).
- Write down the conventions you notice (framework, folder layout, test setup, styling). These go into the brief so future tasks follow them.
- Leave built features out of the plan. Partial features become "finish X" tasks that point at the relevant files.

## Also collect
- **AI tool and plan:** Claude Pro (the default), Max 5x, Max 20x, or another tool. This picks the profile in `plan-budgets.md`.
- **Output:** `tasks.md`, PM tool, or both. If a PM tool, which one.
