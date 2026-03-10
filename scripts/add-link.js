#!/usr/bin/env node
// Usage: node scripts/add-link.js '<json>'
// Example:
//   node scripts/add-link.js '{
//     "url": "https://example.com",
//     "title": "My title",
//     "summary": "...",
//     "source_name": "example.com",
//     "date": "2026-03-10",
//     "category": "journalism",
//     "tags": ["ai"],
//     "comment": "..."
//   }'

const fs   = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', '_data', 'links.json');

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/add-link.js \'<json>\'');
  process.exit(1);
}

let entry;
try {
  entry = JSON.parse(input);
} catch (e) {
  console.error('Invalid JSON:', e.message);
  process.exit(1);
}

if (!entry.url || !entry.title) {
  console.error('Missing required fields: url, title');
  process.exit(1);
}

// Generate a short random id if missing
if (!entry.id) {
  entry.id = Math.random().toString(36).slice(2, 10);
}

// Always stamp with current time so this link sorts first
entry.added_at = new Date().toISOString();

const links = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
links.unshift(entry);
fs.writeFileSync(dataFile, JSON.stringify(links, null, 2) + '\n');

console.log(`Added: "${entry.title}" (id: ${entry.id})`);
