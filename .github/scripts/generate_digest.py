#!/usr/bin/env python3
"""
Génère un weekly digest à partir de _data/links.json
en appelant l'API Claude, puis crée un post Jekyll.
"""
import json
import os
import sys
from datetime import date, timedelta, datetime
from pathlib import Path
import anthropic

# ── Config ────────────────────────────────────────────────────────────────────
REPO_ROOT   = Path(__file__).parent.parent.parent
LINKS_FILE  = REPO_ROOT / "_data" / "links.json"
POSTS_DIR   = REPO_ROOT / "_posts"
WEEK_OFFSET = int(os.environ.get("WEEK_OFFSET", 0))

# ── Date window: last 7 days (or offset) ─────────────────────────────────────
today      = date.today() - timedelta(weeks=WEEK_OFFSET)
week_start = today - timedelta(days=today.weekday() + 7)  # previous Monday
week_end   = week_start + timedelta(days=6)               # previous Sunday

print(f"Digest window: {week_start} → {week_end}")

# ── Load links ────────────────────────────────────────────────────────────────
with open(LINKS_FILE, encoding="utf-8") as f:
    all_links = json.load(f)

week_links = [
    l for l in all_links
    if week_start <= date.fromisoformat(l["date"]) <= week_end
]

if not week_links:
    print("No links found for this week — skipping digest.")
    sys.exit(0)

print(f"Found {len(week_links)} links.")

# ── Build prompt ──────────────────────────────────────────────────────────────
links_text = "\n\n".join(
    f"- [{l['title']}]({l['url']})\n  {l.get('summary', '')}\n  tags: {', '.join(l.get('tags', []))}"
    for l in week_links
)

system_prompt = """Tu es l'assistant éditorial de Pierre-Louis Rolle, consultant
en inclusion numérique et communs. Tu rédiges des digests hebdomadaires en
français, dans un style direct, analytique et légèrement critique. Pas de
superlatifs. Pas d'enthousiasme artificiel. Maximum 350 mots pour le corps."""

user_prompt = f"""Voici les liens sauvegardés cette semaine ({week_start} au {week_end}) :

{links_text}

Rédige un digest hebdomadaire structuré ainsi :
1. Une phrase d'accroche qui capte le fil directeur de la semaine (1-2 phrases max)
2. Pour chaque lien, 1-3 phrases qui expliquent pourquoi c'est intéressant ou ce que ça dit du moment
3. Une courte conclusion / pensée de fin (1-2 phrases)

Ne reformule pas les titres. Reste concis. Format Markdown."""

# ── Call Claude ───────────────────────────────────────────────────────────────
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": user_prompt}],
    system=system_prompt,
)

digest_body = message.content[0].text

# ── Build tags list ───────────────────────────────────────────────────────────
all_tags = set()
for l in week_links:
    all_tags.update(l.get("tags", []))
tags_str = " ".join(sorted(all_tags))

# ── Write Jekyll post ─────────────────────────────────────────────────────────
post_date = week_end  # date the digest is "for"
post_slug = f"{post_date}-weekly-digest"
post_file = POSTS_DIR / f"{post_slug}.md"

# Build links section
links_section = "\n".join(
    f"- [{l['title']}]({l['url']}) — *{l.get('source_name', '')}*"
    for l in week_links
)

post_content = f"""---
layout: post
title: "digest — semaine du {week_start.strftime('%-d %B %Y')}"
date: {post_date}
tags: {tags_str}
---

{digest_body}

---

**{len(week_links)} lien{'s' if len(week_links) > 1 else ''} cette semaine :**

{links_section}
"""

POSTS_DIR.mkdir(exist_ok=True)
post_file.write_text(post_content, encoding="utf-8")
print(f"Digest written to {post_file}")
