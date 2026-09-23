// Usage: node export-plan.mjs <path-to-.mvp> <jira|linear|github|trello|generic> [options] > out
// Builds an import file from tasks.md, so it never has to be hand-written. Each target follows
// that tool's documented import rules:
//   jira:    CSV. Phases → Epic, tasks → Story/Task, sub-tasks → Subtask, linked through numeric
//            "Work item ID" + "Work type" + "Parent" columns, parents first. Import with
//            System → External system import → CSV. Options: --task-type X, --subtask-type X.
//   linear:  CSV in Linear's own export format, for `npx @linear/import` → "Linear (CSV export)".
//            Labels joined with ", "; that importer ignores parents, so steps become a checklist.
//   github:  bash script using the gh CLI. Phases → milestones, tasks → issues, steps → checklist
//            (or real sub-issues with --sub-issues). Options: --project "Title", --sub-issues.
//   trello:  paste-ready text: one block per phase; pasting lines into a Trello list makes one
//            card per line (Trello has no native CSV import).
//   generic: CSV with ID / Type / Parent ID columns, for Asana, ClickUp, Notion, spreadsheets.
import fs from 'fs';

const TARGETS = ['jira', 'linear', 'github', 'trello', 'generic'];
const [dir, target = 'generic', ...rest] = process.argv.slice(2);
if (!dir || !TARGETS.includes(target)) {
  console.error(`Usage: node export-plan.mjs <path-to-.mvp> <${TARGETS.join('|')}> [--task-type X] [--subtask-type X] [--project "Title"] [--sub-issues]`);
  process.exit(2);
}
const opt = (name, def) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : def; };
const SUBTASK = opt('--subtask-type', 'Subtask'); // company-managed Jira projects often call it "Sub-task"
const TASK = opt('--task-type', 'Story');
const PROJECT = opt('--project', '');
const SUB_ISSUES = rest.includes('--sub-issues');

// ---- parse tasks.md -------------------------------------------------------
const md = fs.readFileSync(`${dir}/tasks.md`, 'utf8').replace(/\r\n/g, '\n');
const phases = [];
for (const pBlock of md.split(/\n(?=## Phase )/).slice(1)) {
  const title = pBlock.match(/^## (.+)/)[1].trim();
  const goal = (pBlock.match(/\*\*Goal:\*\*\s*(.*?)(?:\s·\s|\n)/) || [])[1] || '';
  const exit = (pBlock.match(/\*\*Exit:\*\*\s*(.*)/) || [])[1] || '';
  const tasks = [];
  for (const tBlock of pBlock.split(/\n(?=### )/).slice(1)) {
    const h = tBlock.match(/^### \[(.)\] (T-\d+[a-z]?) · (.+?) · (\w+)/);
    if (!h) continue;
    const field = n => ((tBlock.match(new RegExp(`[*][*]${n}:[*][*](.*)`)) || [])[1] || '').trim();
    const subs = [...tBlock.matchAll(/^\s+- \[(.)\] (.+)$/gm)].map(m => ({ done: m[1] === 'x', text: m[2].trim() }));
    tasks.push({ done: h[1] === 'x', id: h[2], title: h[3], size: h[4], goal: field('Goal'), deps: field('Depends on'),
      model: field('Model'), acceptance: field('Acceptance'), context: field('Context to load'), subs });
  }
  phases.push({ title, goal, exit: exit.trim(), tasks });
}
if (!phases.length) { console.error('No "## Phase" sections found in tasks.md'); process.exit(1); }

// ---- helpers --------------------------------------------------------------
const esc = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const toCsv = rows => rows.map(r => r.map(esc).join(',')).join('\n') + '\n';
const taskDescription = (t, withSubs) => [
  `Goal: ${t.goal}`, '',
  'Acceptance criteria:', ...t.acceptance.split(';').map(s => s.trim()).filter(Boolean).map(s => `- ${s}`), '',
  `Depends on: ${t.deps || 'none'}`,
  `Model: ${t.model}`,
  `Context to load: ${t.context}`,
  ...(withSubs ? ['', 'Steps:', ...t.subs.map(s => `- [${s.done ? 'x' : ' '}] ${s.text}`)] : []),
].join('\n');
const labels = t => [`size-${t.size}`, t.model === 'heavy' ? 'model-heavy' : ''].filter(Boolean);

// ---- targets --------------------------------------------------------------
let rows;
if (target === 'jira') {
  // Jira needs unique sequential numeric IDs and parents before children:
  // all epics, then all tasks, then all sub-tasks, numbered in file order.
  let n = 0; const epicRows = [], taskRows = [], subRows = [];
  const pids = phases.map(p => { const id = ++n; epicRows.push([id, 'Epic', '', p.title, `Goal: ${p.goal}\nExit criterion: ${p.exit}`, '']); return id; });
  const tids = new Map();
  phases.forEach((p, pi) => p.tasks.forEach(t => {
    const id = ++n; tids.set(t, id);
    taskRows.push([id, TASK, pids[pi], `${t.id} · ${t.title}`, taskDescription(t, false), labels(t).join(' ')]);
  }));
  phases.forEach(p => p.tasks.forEach(t => t.subs.forEach((s, i) =>
    subRows.push([++n, SUBTASK, tids.get(t), `${t.id}.${i + 1} · ${s.text}`.slice(0, 250), '', '']))));
  rows = [['Work item ID', 'Work type', 'Parent', 'Summary', 'Description', 'Labels'], ...epicRows, ...taskRows, ...subRows];
} else if (target === 'linear') {
  // Column names and formats match Linear's own CSV export, which @linear/import reads back:
  // Labels split on ", ", Priority as text, Status passed through as a workflow state name.
  rows = [['Title', 'Description', 'Priority', 'Estimate', 'Labels', 'Status']];
  for (const p of phases) for (const t of p.tasks)
    rows.push([`${t.id} · ${t.title}`, taskDescription(t, true), 'No priority', t.size === 'S' ? 1 : 2,
      [p.title.replace(/,\s*/g, ' '), ...labels(t)].join(', '), t.done ? 'Done' : 'Todo']);
} else if (target === 'trello') {
  // Trello has no native CSV import; pasting multi-line text into a list creates one card per line.
  const out = ['# Paste each block into its own Trello list ("Add a card" → paste → "Create N cards").',
    '# Card descriptions and checklists aren\'t pasted; they\'re in tasks.md.', ''];
  for (const p of phases) out.push(`## List: ${p.title}`, ...p.tasks.map(t => `${t.id} · ${t.title} [${t.size}${t.model === 'heavy' ? ', heavy' : ''}]`), '');
  process.stdout.write(out.join('\n'));
  process.exit(0);
} else if (target === 'github') {
  // No CSV import on GitHub: emit a gh CLI script. Labels and milestones must exist before
  // `gh issue create` can use them, so they're created first; issue numbers are captured from
  // the printed URL so sub-issues can point at their parent.
  const q = s => `'${String(s).replace(/'/g, `'\\''`)}'`;
  const heredoc = body => `<<'MVP_EOF'\n${body.replace(/^MVP_EOF$/gm, 'MVP_EOF ')}\nMVP_EOF`;
  const out = ['#!/usr/bin/env bash',
    '# Creates the plan as GitHub issues. Run from inside the repo, after `gh auth login`.',
    PROJECT ? '# Adding to a project needs the project scope: gh auth refresh -s project' : '',
    'set -euo pipefail', 'mkdir -p .mvp', ': > .mvp/github-map.txt', '',
    '# Labels (--force updates them if they already exist)',
    `gh label create size-S --color c2e0c6 --description 'Small task' --force`,
    `gh label create size-M --color fbca04 --description 'Medium task' --force`,
    `gh label create model-heavy --color d93f0b --description 'Use your strongest model' --force`,
    `gh label create mvp-step --color ededed --description 'Step of an MVP task' --force`, '',
    '# Milestones (one per phase; skipped if a milestone with that title exists)',
    'milestone() { gh api "repos/{owner}/{repo}/milestones?state=all&per_page=100" --jq \'.[].title\' | grep -Fxq "$1" || gh api -X POST "repos/{owner}/{repo}/milestones" -f title="$1" -f description="$2" >/dev/null; }'];
  for (const p of phases) out.push(`milestone ${q(p.title)} ${q(`Goal: ${p.goal} | Exit: ${p.exit}`)}`);
  out.push('', '# Issues');
  for (const p of phases) for (const t of p.tasks) {
    const v = t.id.replace(/\W/g, '_');
    const flags = [`--title ${q(`${t.id} · ${t.title}`)}`, `--milestone ${q(p.title)}`,
      ...labels(t).map(l => `--label ${l}`), PROJECT ? `--project ${q(PROJECT)}` : ''].filter(Boolean).join(' ');
    out.push(`url_${v}=$(gh issue create ${flags} --body-file - ${heredoc(taskDescription(t, !SUB_ISSUES))}`, ')',
      `echo ${q(t.id)} "$url_${v}" | tee -a .mvp/github-map.txt`);
    if (t.done) out.push(`gh issue close "$url_${v}" --reason completed >/dev/null`);
    if (SUB_ISSUES) t.subs.forEach((s, i) => out.push(
      `gh issue create --title ${q(`${t.id}.${i + 1} · ${s.text}`.slice(0, 250))} --label mvp-step --parent "\${url_${v}##*/}" --body ${q(`Step ${i + 1} of ${t.id}`)} >/dev/null`));
    out.push('');
  }
  out.push('echo "Done. Task → issue links saved to .mvp/github-map.txt"');
  process.stdout.write(out.join('\n') + '\n');
  process.exit(0);
} else {
  rows = [['ID', 'Type', 'Parent ID', 'Title', 'Description', 'Phase', 'Size', 'Model', 'Depends On', 'Status']];
  phases.forEach((p, pi) => {
    const pid = `P-${pi + 1}`;
    rows.push([pid, 'Phase', '', p.title, `Goal: ${p.goal}\nExit criterion: ${p.exit}`, p.title, '', '', '', '']);
    for (const t of p.tasks) {
      rows.push([t.id, 'Task', pid, t.title, taskDescription(t, false), p.title, t.size, t.model, t.deps, t.done ? 'Done' : 'Todo']);
      t.subs.forEach((s, i) => rows.push([`${t.id}.${i + 1}`, 'Sub-task', t.id, s.text, '', p.title, '', '', '', s.done ? 'Done' : 'Todo']));
    }
  });
}
process.stdout.write(toCsv(rows));
