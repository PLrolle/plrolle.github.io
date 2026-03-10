---
layout: default
title: add a link
permalink: /add
---

<style>
  #add-page { max-width: 480px; margin: 0 auto; padding: 0 0.5rem; }
  #add-page h1 { font-size: 1.1rem; margin-bottom: 1rem; }
  .lc-label {
    display:block; font-size:0.7rem; font-weight:bold;
    text-transform:uppercase; letter-spacing:0.05em;
    margin-bottom:0.3rem; margin-top:1rem;
  }
  .lc-label:first-of-type { margin-top: 0; }
  .lc-input, .lc-textarea, .lc-select {
    width:100%; border:2px solid black; padding:0.5rem 0.6rem;
    font-family:monospace; font-size:14px;
    background:white; color:black; box-sizing:border-box;
    -webkit-appearance:none; border-radius:0;
  }
  .lc-textarea { min-height:70px; resize:vertical; }
  .lc-select { cursor:pointer; }
  .lc-tags {
    display:flex; flex-wrap:wrap; gap:0.3rem;
    border:2px solid black; padding:0.4rem; min-height:2.4rem; cursor:text;
    box-sizing:border-box;
  }
  .lc-chip {
    background:black; color:white; padding:0.15rem 0.5rem;
    font-family:monospace; font-size:0.8rem;
    display:flex; align-items:center; gap:0.2rem;
  }
  .lc-chip button {
    background:none; border:none; color:white; cursor:pointer;
    font-size:1rem; padding:0; line-height:1;
  }
  .lc-tag-input {
    border:none; outline:none; font-family:monospace; font-size:14px;
    flex:1; min-width:80px; background:transparent;
  }
  .lc-btn {
    display:block; width:100%; background:black; color:white;
    border:none; padding:0.7rem; font-family:monospace; font-size:15px;
    cursor:pointer; font-weight:bold; margin-top:1.2rem;
    -webkit-appearance:none; border-radius:0;
  }
  .lc-btn:hover { opacity:0.8; }
  .lc-btn:disabled { opacity:0.4; cursor:not-allowed; }
  #lc-status {
    margin-top:0.6rem; padding:0.5rem 0.6rem; font-family:monospace;
    font-size:0.8rem; border:2px solid black; display:none;
  }
  #lc-status.ok { background:black; color:white; }
  #lc-url-preview {
    font-size:0.75rem; color:#555; word-break:break-all;
    margin-bottom:0.8rem; padding-bottom:0.8rem; border-bottom:1px solid #ddd;
  }
  #lc-og-img {
    width:100%; max-height:100px; object-fit:cover;
    border:2px solid black; display:none; margin-top:0.4rem;
  }
  #fetching-indicator {
    font-size:0.75rem; opacity:0.5; margin-top:0.3rem; display:none;
  }
  .section-sep { border:none; border-top:2px solid black; margin:2rem 0; }
  .setup-step { margin-bottom:1rem; }
  .setup-step code {
    background:#f0f0f0; padding:0.15rem 0.35rem;
    font-family:monospace; font-size:0.85rem;
  }
  #config-section details { margin-bottom:0.5rem; }
  #config-section summary {
    cursor:pointer; font-size:0.8rem; opacity:0.7; padding:0.3rem 0;
  }
  #config-section summary:hover { opacity:1; }
  .lc-small { font-size:0.75rem; opacity:0.6; margin-top:0.2rem; }
</style>

<div id="add-page">

<h1>/// add a link</h1>

<div id="lc-url-preview">no url provided</div>
<img id="lc-og-img" alt="">
<div id="fetching-indicator">fetching page info...</div>

<div id="form-area">
  <label class="lc-label">title</label>
  <input class="lc-input" id="lc-title" type="text" placeholder="page title">

  <label class="lc-label">summary <span style="opacity:0.45;font-weight:normal;text-transform:none">(optional)</span></label>
  <textarea class="lc-textarea" id="lc-summary" placeholder="short description..."></textarea>

  <label class="lc-label">category</label>
  <select class="lc-select" id="lc-category">
    <option value="">— select a category —</option>
    <option value="journalism">Journalism</option>
    <option value="opinion">Opinion &amp; Essay</option>
    <option value="academic-paper">Academic Paper</option>
    <option value="research-report">Research &amp; Report</option>
    <option value="podcast">Podcast</option>
    <option value="video">Video</option>
    <option value="long-read">Long Read</option>
    <option value="interview">Interview</option>
    <option value="tool-project">Tool &amp; Project</option>
    <option value="data-viz">Data &amp; Viz</option>
  </select>

  <label class="lc-label">your note <span style="opacity:0.45;font-weight:normal;text-transform:none">(optional)</span></label>
  <textarea class="lc-textarea" id="lc-comment" placeholder="why does this matter..."></textarea>

  <label class="lc-label">tags <span style="opacity:0.45;font-weight:normal;text-transform:none">(press Enter to confirm)</span></label>
  <div class="lc-tags" id="lc-tags" onclick="document.getElementById('lc-tag-input').focus()">
    <input class="lc-tag-input" id="lc-tag-input" placeholder="commons, ai, policy...">
  </div>

  <button class="lc-btn" id="lc-save-btn">+ save</button>
  <div id="lc-status"></div>
</div>

<hr class="section-sep">

<div id="config-section">
  <details>
    <summary>⚙ settings (token &amp; repo)</summary>
    <div style="margin-top:0.8rem">
      <label class="lc-label">GitHub Token</label>
      <input class="lc-input" id="lc-token" type="password" placeholder="github_pat_...">
      <p class="lc-small">Fine-grained token · repo <code>plrolle.github.io</code> · Contents: Read &amp; write</p>

      <label class="lc-label">GitHub Repo</label>
      <input class="lc-input" id="lc-repo" value="plrolle/plrolle.github.io">
    </div>
  </details>
</div>

<hr class="section-sep">

<h2 style="font-size:1rem">iOS Shortcut setup</h2>
<p style="font-size:0.85rem">Save any page to /links directly from the iOS Share Sheet in two minutes.</p>

<div class="setup-step">
  <strong>1.</strong> Open the <strong>Shortcuts</strong> app on your iPhone/iPad.
</div>
<div class="setup-step">
  <strong>2.</strong> Tap <strong>+</strong> to create a new shortcut. Name it <em>Save to /links</em>.
</div>
<div class="setup-step">
  <strong>3.</strong> Tap <strong>Add Action</strong> and search for <strong>"URL"</strong>. Select the <strong>URL</strong> action. Leave it empty for now — it will receive the shared URL.
</div>
<div class="setup-step">
  <strong>4.</strong> Add a second action: search <strong>"Open URLs"</strong>. In the URL field, tap the variable icon and choose <strong>Shortcut Input</strong>. Then prepend the /add address:<br><br>
  <code>https://plrolle.github.io/add?url=</code><br><br>
  The full value should look like:<br>
  <code>https://plrolle.github.io/add?url=<strong>[Shortcut Input]</strong></code>
</div>
<div class="setup-step">
  <strong>5.</strong> Tap the shortcut settings (name at top) → enable <strong>"Show in Share Sheet"</strong> → set input type to <strong>URLs</strong>.
</div>
<div class="setup-step">
  <strong>6.</strong> Save. Now when you tap Share on any page, you'll see <em>Save to /links</em> in the list.
</div>

<p style="font-size:0.8rem;opacity:0.6;margin-top:1rem">
  The shortcut opens Safari on this /add page with the URL pre-filled.
  Your token is stored in your browser (localStorage) — configure it once in Settings above.
</p>

</div><!-- #add-page -->

<script>
(function() {
  // ── State ─────────────────────────────────────────────────────────────────
  let tags = [];
  const params = new URLSearchParams(location.search);
  const pageUrl = params.get('url') || '';

  // ── Load saved credentials ─────────────────────────────────────────────────
  const savedToken = localStorage.getItem('ghToken') || '';
  const savedRepo  = localStorage.getItem('ghRepo')  || 'plrolle/plrolle.github.io';
  document.getElementById('lc-token').value = savedToken;
  document.getElementById('lc-repo').value  = savedRepo;

  document.getElementById('lc-token').addEventListener('input', function() {
    const v = this.value.trim();
    if (v) localStorage.setItem('ghToken', v); else localStorage.removeItem('ghToken');
  });
  document.getElementById('lc-repo').addEventListener('input', function() {
    localStorage.setItem('ghRepo', this.value.trim());
  });

  // ── Show URL ──────────────────────────────────────────────────────────────
  const urlPreview = document.getElementById('lc-url-preview');
  if (pageUrl) {
    urlPreview.textContent = pageUrl;
  } else {
    urlPreview.textContent = 'no url — open this page from the iOS Share Sheet or add ?url=... to the address bar';
    urlPreview.style.color = '#999';
  }

  // ── Fetch OG via microlink ────────────────────────────────────────────────
  if (pageUrl) {
    const indicator = document.getElementById('fetching-indicator');
    indicator.style.display = 'block';

    fetch('https://api.microlink.io?url=' + encodeURIComponent(pageUrl))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        indicator.style.display = 'none';
        if (data && data.status === 'success' && data.data) {
          const d = data.data;
          if (d.title && !document.getElementById('lc-title').value)
            document.getElementById('lc-title').value = d.title;
          if (d.description && !document.getElementById('lc-summary').value)
            document.getElementById('lc-summary').value = d.description;
          if (d.image && d.image.url) {
            const img = document.getElementById('lc-og-img');
            img.src = d.image.url;
            img.style.display = 'block';
          }
        }
      })
      .catch(function() { indicator.style.display = 'none'; });
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  document.getElementById('lc-tag-input').addEventListener('keydown', function(e) {
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
    const container = document.getElementById('lc-tags');
    const input = document.getElementById('lc-tag-input');
    container.querySelectorAll('.lc-chip').forEach(function(el) { el.remove(); });
    tags.forEach(function(tag) {
      const chip = document.createElement('span');
      chip.className = 'lc-chip';
      const btn = document.createElement('button');
      btn.textContent = '×';
      btn.onclick = function() { tags = tags.filter(function(t){return t!==tag;}); renderTags(); };
      chip.appendChild(document.createTextNode('#'+tag+' '));
      chip.appendChild(btn);
      container.insertBefore(chip, input);
    });
  }

  // ── Status ────────────────────────────────────────────────────────────────
  function showStatus(msg, type) {
    const el = document.getElementById('lc-status');
    el.textContent = msg;
    el.className = type || '';
    el.style.display = 'block';
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  document.getElementById('lc-save-btn').addEventListener('click', async function() {
    const title    = document.getElementById('lc-title').value.trim();
    const summary  = document.getElementById('lc-summary').value.trim();
    const category = document.getElementById('lc-category').value;
    const comment  = document.getElementById('lc-comment').value.trim();
    const token    = document.getElementById('lc-token').value.trim();
    const repo     = document.getElementById('lc-repo').value.trim();

    if (!pageUrl)  return showStatus('error: no URL to save.');
    if (!title)    return showStatus('error: title is required.');
    if (!token)    return showStatus('error: GitHub token missing — open Settings above.');

    const btn = this;
    btn.disabled = true;
    btn.textContent = 'saving...';

    try {
      const hostname = (function() {
        try { return new URL(pageUrl).hostname.replace(/^www\./,''); } catch(e) { return ''; }
      })();
      const favicon = hostname ? 'https://www.google.com/s2/favicons?domain=' + hostname + '&sz=32' : '';

      const fileRes = await fetch(
        'https://api.github.com/repos/' + repo + '/contents/_data/links.json',
        { headers: { Authorization: 'token ' + token, Accept: 'application/vnd.github.v3+json' } }
      );
      let links = [], sha = null;
      if (fileRes.ok) {
        const fd = await fileRes.json();
        sha = fd.sha;
        links = JSON.parse(decodeURIComponent(escape(atob(fd.content.replace(/\n/g,'')))));
      }

      const entry = {
        id:             Date.now().toString(36),
        url:            pageUrl,
        title:          title,
        summary:        summary,
        source_name:    hostname,
        source_favicon: favicon,
        date:           new Date().toISOString().slice(0,10),
        added_at:       new Date().toISOString(),
        tags:           tags
      };
      if (category) entry.category = category;
      if (comment)  entry.comment  = comment;

      links.unshift(entry);

      const body = {
        message: 'add link: ' + title,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(links, null, 2))))
      };
      if (sha) body.sha = sha;

      const putRes = await fetch(
        'https://api.github.com/repos/' + repo + '/contents/_data/links.json',
        {
          method: 'PUT',
          headers: {
            Authorization: 'token ' + token,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );
      if (!putRes.ok) {
        const err = await putRes.json();
        throw new Error(err.message || putRes.statusText);
      }

      showStatus('✓ saved! will appear on /links after ~1 min.', 'ok');
      btn.textContent = '✓ saved';
    } catch(e) {
      showStatus('error: ' + e.message);
      btn.disabled = false;
      btn.textContent = '+ save';
    }
  });
})();
</script>
