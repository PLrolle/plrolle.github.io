#!/opt/node22/bin/node
// Usage:
//   node scripts/digest.js           → current bi-weekly period (AI digest if ANTHROPIC_API_KEY set)
//   node scripts/digest.js 2026-03-10 → period starting on the Monday of that date
//   node scripts/digest.js --no-ai   → skip AI, output plain link list

const fs   = require('fs');
const path = require('path');

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMonday(d) {
  const date = new Date(d);
  const day  = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function formatDate(d) {
  return d.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// ── AI digest ─────────────────────────────────────────────────────────────────

async function generateDigest(links, startDate, endDate) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client    = new Anthropic.default();

  const linksList = links.map(l => {
    const parts = [
      `- Title: ${l.title}`,
      `  URL: ${l.url}`,
      `  Source: ${l.source_name || ''}`,
    ];
    if (l.summary) parts.push(`  Summary: ${l.summary}`);
    if (l.comment) parts.push(`  Note: ${l.comment}`);
    if (l.tags?.length) parts.push(`  Tags: ${l.tags.join(', ')}`);
    return parts.join('\n');
  }).join('\n\n');

  const systemPrompt = `You are a press review editor. Your job is to produce a concise, factual bi-weekly digest of curated links.

## Format

- Write in English.
- For each link, provide:
  - The title (linked)
  - The source name
  - If the article is NOT in English, add a language tag in brackets, e.g. [FR], [ES]
  - A 1-2 sentence factual summary of what the piece covers. No commentary, no opinion, no "this is important because…"

- Group links by broad topic area (e.g. "AI governance", "Digital public infrastructure", "Open source", "Cybersecurity"…). Use the actual content to determine categories — do not force a predefined taxonomy.

- Do NOT try to find a narrative thread or overarching theme across the links. This is a curated reading list, not an essay. Each item stands on its own.

## Tone & style

- Neutral, factual, editorial. Think: a librarian's annotated bibliography, not a LinkedIn thought leader.
- No superlatives, no hype words ("groundbreaking", "game-changing", "crucial").
- No meta-commentary ("this week was marked by…", "a recurring theme emerges…", "it's worth noting that…").
- No introductory paragraph trying to synthesize everything. Start directly with the first category.
- A short sign-off line at the end with the date range covered is fine.

## What to avoid

- Forced connections between unrelated articles
- Editorializing or personal takes
- Filler sentences
- AI-sounding rhetorical patterns (rhetorical questions, "in an era of…", "as we navigate…", triadic structures)`;

  const message = await client.messages.create({
    model:      'claude-opus-4-6',
    max_tokens: 2000,
    system:     systemPrompt,
    messages:   [{
      role:    'user',
      content: `Here are the links to include in this bi-weekly digest (covering ${startDate} to ${endDate}):\n\n${linksList}\n\nProduce the digest now.`,
    }],
  });

  return message.content[0].text.trim();
}

// ── Plain fallback (no AI) ────────────────────────────────────────────────────

function buildPlainBody(links) {
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

  let body = '';
  links.forEach(link => {
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
  return body;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2);
  const noAI    = args.includes('--no-ai');
  const dateArg = args.find(a => !a.startsWith('--'));

  const root     = path.join(__dirname, '..');
  const dataFile = path.join(root, '_data', 'links.json');
  const postsDir = path.join(root, '_posts');

  const links = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

  const refDate  = dateArg ? new Date(dateArg) : new Date();
  const monday   = getMonday(refDate);
  const endDate  = addDays(monday, 13); // 14-day window

  const periodLinks = links.filter(l => {
    const d = new Date(l.date);
    return d >= monday && d <= endDate;
  });

  if (periodLinks.length === 0) {
    console.error(`No links found for period ${isoDate(monday)} → ${isoDate(endDate)}`);
    process.exit(1);
  }

  // ── Generate content ──
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  let content;

  if (!noAI && hasKey) {
    process.stdout.write('Generating digest with Claude... ');
    content = await generateDigest(periodLinks, isoDate(monday), isoDate(endDate));
    console.log('done.');
  } else {
    if (!noAI && !hasKey) console.log('No ANTHROPIC_API_KEY — falling back to plain list.');
    content = buildPlainBody(periodLinks);
  }

  // ── Build post ──
  const title    = `Bi-weekly digest — ${formatDate(monday)}`;
  const filename = `${isoDate(monday)}-biweekly.md`;
  const outPath  = path.join(postsDir, filename);

  let body = '';
  body += `---\n`;
  body += `layout: post\n`;
  body += `title: "${title}"\n`;
  body += `date: ${isoDate(monday)}\n`;
  body += `---\n\n`;
  body += content;
  body += `\n`;

  fs.writeFileSync(outPath, body);
  console.log(`Created: _posts/${filename} (${periodLinks.length} links)`);
}

main().catch(err => { console.error(err); process.exit(1); });
