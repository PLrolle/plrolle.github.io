---
layout: default
title: bookmarklet
permalink: /bookmarklet.html
---

<h1>bookmarklet — link curator</h1>

<p>Configure tes identifiants ci-dessous, puis glisse le bouton vers ta barre de favoris.</p>

<hr>

<div id="config">

<p><strong>1. Token GitHub</strong> — créer sur <a href="https://github.com/settings/tokens?type=beta" target="_blank">github.com/settings/tokens</a><br>
<small>Fine-grained token · repo <code>plrolle.github.io</code> · permission Contents : Read and write</small></p>

<input type="text" id="ghToken" placeholder="github_pat_..." style="width:100%;font-family:monospace;font-size:13px;border:2px solid black;padding:0.4rem;margin-bottom:1rem;box-sizing:border-box">

<p><strong>2. Repo GitHub</strong></p>
<input type="text" id="ghRepo" value="plrolle/plrolle.github.io" style="width:100%;font-family:monospace;font-size:13px;border:2px solid black;padding:0.4rem;margin-bottom:1.5rem;box-sizing:border-box">

<p><strong>3. Glisse ce bouton dans ta barre de favoris :</strong></p>

<p>
  <a id="bookmarkletLink" href="#" onclick="return false"
     style="display:inline-block;background:black;color:white;font-family:monospace;font-size:14px;padding:0.5rem 1rem;text-decoration:none;cursor:grab;border:2px solid black">
    + save link
  </a>
  <span style="font-size:0.8rem;opacity:0.6;margin-left:0.7rem">← glisser vers la barre de favoris</span>
</p>

<p style="font-size:0.8rem;opacity:0.6">
  <strong>Safari :</strong> afficher la barre de favoris avec ⇧⌘B, puis glisser.<br>
  <strong>Firefox :</strong> afficher la barre avec ⇧⌘B, puis glisser.
</p>

</div>

<hr>

<h2>utilisation</h2>
<ol>
  <li>Sur n'importe quelle page, cliquer sur le favori <strong>+ save link</strong></li>
  <li>Un panneau apparaît avec le titre et la description récupérés automatiquement</li>
  <li>Modifier si nécessaire, ajouter des tags (Entrée pour valider)</li>
  <li>Cliquer <strong>sauvegarder</strong></li>
  <li>Le lien apparaît sur <a href="/links.html">/links</a> après ~1 minute</li>
</ol>

<script>
const BOOKMARKLET_CODE = function(GITHUB_TOKEN, GITHUB_REPO) {
  // Check if already open
  if (document.getElementById('__lc_overlay')) return;

  // ── Read OpenGraph meta ───────────────────────────────────────────────────
  function getMeta(selectors) {
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) return el.getAttribute('content') || '';
    }
    return '';
  }

  const ogTitle   = getMeta(['meta[property="og:title"]','meta[name="twitter:title"]']) || document.title;
  const ogDesc    = getMeta(['meta[property="og:description"]','meta[name="twitter:description"]','meta[name="description"]']);
  const ogImage   = getMeta(['meta[property="og:image"]','meta[name="twitter:image"]']);
  const ogSite    = getMeta(['meta[property="og:site_name"]']) || location.hostname.replace(/^www\./,'');
  const favicon   = 'https://www.google.com/s2/favicons?domain=' + location.hostname + '&sz=32';
  const pageUrl   = location.href;

  // ── Tags state ─────────────────────────────────────────────────────────────
  let tags = [];

  // ── Styles ────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #__lc_overlay {
      position:fixed;top:0;right:0;bottom:0;left:0;
      background:rgba(0,0,0,0.5);z-index:2147483646;
      font-family:monospace!important;
    }
    #__lc_panel {
      position:fixed;top:50%;right:1rem;
      transform:translateY(-50%);
      background:white;border:3px solid black;
      width:320px;max-height:90vh;overflow-y:auto;
      z-index:2147483647;padding:0;
      font-family:monospace!important;font-size:13px;color:black;
    }
    #__lc_panel * { box-sizing:border-box; font-family:monospace!important; }
    #__lc_header {
      background:black;color:white;padding:0.5rem 0.8rem;
      display:flex;justify-content:space-between;align-items:center;
    }
    #__lc_body { padding:0.8rem; }
    .__lc_label {
      display:block;font-size:0.7rem;font-weight:bold;
      text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.2rem;margin-top:0.7rem;
    }
    .__lc_label:first-child { margin-top:0; }
    .__lc_input, .__lc_textarea {
      width:100%;border:1px solid black;padding:0.3rem 0.4rem;
      background:white;color:black;font-size:12px;
    }
    .__lc_textarea { min-height:60px;max-height:100px;resize:vertical; }
    .__lc_tags {
      display:flex;flex-wrap:wrap;gap:0.3rem;
      border:1px solid black;padding:0.3rem;min-height:2rem;cursor:text;
    }
    .__lc_chip {
      background:black;color:white;padding:0.1rem 0.4rem;
      font-size:0.75rem;display:flex;align-items:center;gap:0.2rem;
    }
    .__lc_chip button {
      background:none;border:none;color:white;cursor:pointer;
      font-size:0.9rem;padding:0;line-height:1;
    }
    .__lc_tag_input {
      border:none;outline:none;font-size:12px;flex:1;min-width:80px;background:transparent;
    }
    .__lc_btn {
      display:block;width:100%;background:black;color:white;
      border:none;padding:0.5rem;font-size:13px;cursor:pointer;
      font-weight:bold;margin-top:0.8rem;font-family:monospace;
    }
    .__lc_btn:hover { opacity:0.8; }
    .__lc_btn:disabled { opacity:0.4;cursor:not-allowed; }
    .__lc_status {
      margin-top:0.5rem;padding:0.4rem;font-size:0.75rem;
      border:1px solid black;display:none;
    }
    .__lc_status.ok { background:black;color:white; }
    .__lc_og_img {
      width:100%;max-height:80px;object-fit:cover;
      border:1px solid black;display:block;margin-top:0.5rem;
    }
    .__lc_close {
      background:none;border:none;color:white;font-size:1.2rem;
      cursor:pointer;padding:0;line-height:1;
    }
    .__lc_url {
      font-size:0.7rem;opacity:0.6;overflow:hidden;
      text-overflow:ellipsis;white-space:nowrap;
      margin-bottom:0.5rem;border-bottom:1px solid #ddd;padding-bottom:0.5rem;
    }
  `;
  document.head.appendChild(style);

  // ── HTML ──────────────────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = '__lc_overlay';
  overlay.onclick = (e) => { if (e.target === overlay) cleanup(); };

  const panel = document.createElement('div');
  panel.id = '__lc_panel';
  panel.innerHTML = `
    <div id="__lc_header">
      <span>/// link curator</span>
      <button class="__lc_close" id="__lc_closeBtn">×</button>
    </div>
    <div id="__lc_body">
      <div class="__lc_url" id="__lc_url">${pageUrl}</div>
      ${ogImage ? `<img class="__lc_og_img" src="${ogImage}" alt="">` : ''}
      <label class="__lc_label">titre</label>
      <input class="__lc_input" id="__lc_title" value="${ogTitle.replace(/"/g,'&quot;')}">
      <label class="__lc_label">description</label>
      <textarea class="__lc_textarea" id="__lc_desc">${ogDesc}</textarea>
      <label class="__lc_label">tags (Entrée pour valider)</label>
      <div class="__lc_tags" id="__lc_tags" onclick="document.getElementById('__lc_tagInput').focus()">
        <input class="__lc_tag_input" id="__lc_tagInput" placeholder="commons, ia, politique...">
      </div>
      <button class="__lc_btn" id="__lc_saveBtn">+ sauvegarder</button>
      <div class="__lc_status" id="__lc_status"></div>
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  document.head.appendChild(style);

  // ── Logic ─────────────────────────────────────────────────────────────────
  function cleanup() {
    overlay.remove();
    style.remove();
  }

  document.getElementById('__lc_closeBtn').onclick = cleanup;

  const tagInput = document.getElementById('__lc_tagInput');
  tagInput.addEventListener('keydown', function(e) {
    const val = this.value.trim().toLowerCase().replace(/\s+/g,'-').replace(/,/g,'');
    if ((e.key === 'Enter' || e.key === ',') && val) {
      e.preventDefault();
      if (!tags.includes(val)) { tags.push(val); renderTags(); }
      this.value = '';
    }
    if (e.key === 'Backspace' && this.value === '' && tags.length > 0) {
      tags.pop(); renderTags();
    }
  });

  function renderTags() {
    const container = document.getElementById('__lc_tags');
    const input = document.getElementById('__lc_tagInput');
    container.querySelectorAll('.__lc_chip').forEach(el => el.remove());
    tags.forEach(function(tag) {
      const chip = document.createElement('span');
      chip.className = '__lc_chip';
      const btn = document.createElement('button');
      btn.textContent = '×';
      btn.onclick = function() { tags = tags.filter(function(t){return t!==tag;}); renderTags(); };
      chip.appendChild(document.createTextNode('#'+tag+' '));
      chip.appendChild(btn);
      container.insertBefore(chip, input);
    });
  }

  function showStatus(msg, type) {
    const el = document.getElementById('__lc_status');
    el.textContent = msg;
    el.className = '__lc_status ' + (type||'');
    el.style.display = 'block';
  }

  document.getElementById('__lc_saveBtn').onclick = async function() {
    const title   = document.getElementById('__lc_title').value.trim();
    const summary = document.getElementById('__lc_desc').value.trim();
    if (!title) return showStatus('titre requis.', 'err');

    this.disabled = true;
    this.textContent = 'envoi...';

    try {
      const fileRes = await fetch(
        'https://api.github.com/repos/' + GITHUB_REPO + '/contents/_data/links.json',
        { headers: { Authorization: 'token ' + GITHUB_TOKEN, Accept: 'application/vnd.github.v3+json' } }
      );
      let links = [], sha = null;
      if (fileRes.ok) {
        const fd = await fileRes.json();
        sha = fd.sha;
        links = JSON.parse(decodeURIComponent(escape(atob(fd.content.replace(/\n/g,'')))));
      }

      links.unshift({
        id: Date.now().toString(36),
        url: pageUrl,
        title: title,
        summary: summary,
        source_name: ogSite,
        source_favicon: favicon,
        date: new Date().toISOString().slice(0,10),
        tags: tags
      });

      const body = { message: 'add link: ' + title, content: btoa(unescape(encodeURIComponent(JSON.stringify(links,null,2)))) };
      if (sha) body.sha = sha;

      const putRes = await fetch(
        'https://api.github.com/repos/' + GITHUB_REPO + '/contents/_data/links.json',
        { method:'PUT', headers:{ Authorization:'token '+GITHUB_TOKEN, Accept:'application/vnd.github.v3+json','Content-Type':'application/json' }, body:JSON.stringify(body) }
      );
      if (!putRes.ok) { const err = await putRes.json(); throw new Error(err.message||putRes.statusText); }

      showStatus('✓ lien sauvegardé !', 'ok');
      setTimeout(cleanup, 1500);
    } catch(e) {
      showStatus('erreur : ' + e.message, 'err');
      document.getElementById('__lc_saveBtn').disabled = false;
      document.getElementById('__lc_saveBtn').textContent = '+ sauvegarder';
    }
  };
}.toString();

function updateBookmarklet() {
  const token = document.getElementById('ghToken').value.trim();
  const repo  = document.getElementById('ghRepo').value.trim();

  const code = '(' + BOOKMARKLET_CODE + ')("' + token.replace(/"/g,'\\"') + '","' + repo.replace(/"/g,'\\"') + '");';
  document.getElementById('bookmarkletLink').href = 'javascript:' + encodeURIComponent(code);
}

document.getElementById('ghToken').addEventListener('input', updateBookmarklet);
document.getElementById('ghRepo').addEventListener('input', updateBookmarklet);
updateBookmarklet();
</script>
