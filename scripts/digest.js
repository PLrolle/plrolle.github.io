#!/usr/bin/env node
// Usage:
//   node scripts/digest.js           → current week
//   node scripts/digest.js 2026-03-10 → week containing that date

const fs   = require('fs');
const path = require('path');

const CAT_LABELS = {
  'journalism':      'Journalism',
  'opinion':         'Opinion & Essay',
  'academic-paper':  'Academic Paper',
  'research-report': 'Research & Report',
  'podcast':         'Podcast',
  'video':           'Video',
  'long-read':       'Long Read',
  'interview':       'Interview',
  'tool-project':    'Tool & Project',
  'data-viz':        'Data & Viz',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMonday(d) {
  const date = new Date(d);
  const day  = date.getUTCDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1 - day);
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getSunday(monday) {
  const d = new Date(monday);
  d.setUTCDate(d.getUTCDate() + 6);
  return d;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function weekNumber(d) {
  const date  = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function formatMonth(d) {
  return d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
}

// ── Main ─────────────────────────────────────────────────────────────────────

const root    = path.join(__dirname, '..');
const dataFile = path.join(root, '_data', 'links.json');
const postsDir = path.join(root, '_posts');

const links = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const refDate = process.argv[2] ? new Date(process.argv[2]) : new Date();
const monday  = getMonday(refDate);
const sunday  = getSunday(monday);
const wNum    = weekNumber(monday);
const year    = monday.getUTCFullYear();

const weekLinks = links
  .filter(l => {
    const d = new Date(l.date);
    return d >= monday && d <= sunday;
  })
  .sort((a, b) => new Date(b.added_at) - new Date(a.added_at));

if (weekLinks.length === 0) {
  console.error(`No links found for week ${wNum} (${isoDate(monday)} → ${isoDate(sunday)})`);
  process.exit(1);
}

// ── Build post ───────────────────────────────────────────────────────────────

const title    = `Links — w.${String(wNum).padStart(2, '0')}, ${formatMonth(monday)} ${year}`;
const filename = `${isoDate(monday)}-links-w${String(wNum).padStart(2, '0')}-${year}.md`;
const outPath  = path.join(postsDir, filename);

let body = '';
body += `---\n`;
body += `layout: post\n`;
body += `title: "${title}"\n`;
body += `date: ${isoDate(monday)}\n`;
body += `---\n\n`;
body += `${weekLinks.length} link${weekLinks.length !== 1 ? 's' : ''} this week.\n`;

weekLinks.forEach(link => {
  const cat  = CAT_LABELS[link.category] || link.category || '';
  const tags = (link.tags || []).map(t => `\`#${t}\``).join(' ');

  body += `\n---\n\n`;
  body += `**[${link.title}](${link.url})**\n`;
  if (cat) body += `*${cat}*`;
  if (cat && link.source_name) body += ` — `;
  if (link.source_name) body += `*${link.source_name}*`;
  if (cat || link.source_name) body += `\n`;
  if (link.summary) body += `\n${link.summary}\n`;
  if (link.comment) body += `\n> ${link.comment}\n`;
  if (tags) body += `\n${tags}\n`;
});

fs.writeFileSync(outPath, body);
console.log(`Created: _posts/${filename} (${weekLinks.length} links)`);
