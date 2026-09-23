// Usage: node check-plan.mjs <path-to-.mvp> [pro|max5|max20]
// Validates tasks.md + brief.md against the mvp-to-tasks rules. Exit code 1 if any rule is broken.
import fs from 'fs';
const dir = process.argv[2];
const md = fs.readFileSync(`${dir}/tasks.md`, 'utf8');
const brief = fs.readFileSync(`${dir}/brief.md`, 'utf8');
const profiles = { pro: [3, 8], max5: [4, 12], max20: [5, 15] };
const [mh, mf] = profiles[process.argv[3] || 'pro'] || profiles.pro;
const P = { maxHandoffs: mh, maxFiles: mf, minSub: 2, maxSub: 6 };
const problems = [], tasks = [];
for (const block of md.split(/\n(?=### )/).slice(1)) {
  const h = block.match(/^### \[(.)\] (T-\d+[a-z]?) · (.+?) · (\w+)/);
  if (!h) { problems.push(`bad heading: ${block.split('\n')[0]}`); continue; }
  const [, , id, title, size] = h;
  const field = n => (block.match(new RegExp(`[*][*]${n}:[*][*](.*)`)) || [])[1]?.trim();
  const deps = (field('Depends on') || '').match(/T-\d+[a-z]?/g) || [];
  const model = field('Model'); const ctx = field('Context to load') || '';
  const handoffs = ctx.match(/H:T-\d+[a-z]?/g)?.map(x => x.slice(2)) || [];
  const files = (ctx.split('files:')[1] || '').match(/`[^`]+`/g) || [];
  const subs = block.match(/^\s+- \[.\] /gm) || [];
  const t = { id, title, size, model, deps, handoffs, files, subs: subs.length };
  tasks.push(t);
  for (const f of ['Goal', 'Acceptance', 'Model', 'Context to load']) if (!field(f)) problems.push(`${id}: missing ${f}`);
  if (!['S', 'M'].includes(size)) problems.push(`${id}: size ${size} not S/M`);
  if (!['light', 'heavy'].includes(model)) problems.push(`${id}: model "${model}"`);
  if (t.subs < P.minSub || t.subs > P.maxSub) problems.push(`${id}: ${t.subs} sub-tasks`);
  if (!/Verify:.*handoff/.test(block)) problems.push(`${id}: last sub-task isn't "Verify … + write handoff"`);
  if (handoffs.length > P.maxHandoffs) problems.push(`${id}: ${handoffs.length} handoffs > ${P.maxHandoffs}`);
  if (files.length > P.maxFiles) problems.push(`${id}: ${files.length} files > ${P.maxFiles}`);
  for (const x of handoffs) if (!deps.includes(x)) problems.push(`${id}: loads H:${x} but doesn't depend on it`);
}
const ids = tasks.map(t => t.id);
tasks.forEach((t, i) => t.deps.forEach(d => { const j = ids.indexOf(d);
  if (j < 0) problems.push(`${t.id}: unknown dep ${d}`); else if (j >= i) problems.push(`${t.id}: dep ${d} is not earlier`); }));
const n = (s, m) => tasks.filter(t => t.size === s && t.model === m).length;
const w = (n('S','light')*0.2 + n('M','light')*0.3 + n('S','heavy')*0.35 + n('M','heavy')*0.5) * 1.2;
const words = brief.split(/\s+/).length;
const hdr = md.match(/~(\d+)[–-](\d+) usage windows/);
if (!hdr) problems.push(`header: window estimate not filled in (expected "~X–Y usage windows"; script estimate ${w.toFixed(1)})`);
else if (w < +hdr[1] || w > +hdr[2]) problems.push(`header: says ~${hdr[1]}–${hdr[2]} windows but estimate is ${w.toFixed(1)}`);
console.log(`tasks=${tasks.length} light=${tasks.filter(t=>t.model==='light').length} heavy=${tasks.filter(t=>t.model==='heavy').length} S=${tasks.filter(t=>t.size==='S').length} M=${tasks.filter(t=>t.size==='M').length}`);
console.log(`Pro window estimate ≈ ${w.toFixed(1)}`);
console.log(`brief: ${words} words (${words <= 450 ? 'OK ≤1 page' : 'TOO LONG'})`);
console.log(`max handoffs/task=${Math.max(...tasks.map(t=>t.handoffs.length))} max files/task=${Math.max(...tasks.map(t=>t.files.length))}`);
console.log(problems.length ? 'PROBLEMS:\n- ' + problems.join('\n- ') : 'No rule violations.');
process.exitCode = problems.length ? 1 : 0;
