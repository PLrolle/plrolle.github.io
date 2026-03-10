// ── State ─────────────────────────────────────────────────────────────────────
let currentUrl = '';
let currentFavicon = '';
let currentSourceName = '';
let tags = [];

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadPageInfo();
});

// ── Load settings from storage ────────────────────────────────────────────────
async function loadSettings() {
  const data = await chrome.storage.local.get(['githubToken', 'githubRepo']);
  if (data.githubToken) document.getElementById('githubToken').value = data.githubToken;
  if (data.githubRepo) document.getElementById('githubRepo').value = data.githubRepo;
  else document.getElementById('githubRepo').value = 'plrolle/plrolle.github.io';
}

async function saveSettings() {
  const token = document.getElementById('githubToken').value.trim();
  const repo  = document.getElementById('githubRepo').value.trim();
  await chrome.storage.local.set({ githubToken: token, githubRepo: repo });
  showStatus('paramètres enregistrés.', 'ok');
}

// ── Load OpenGraph data from current tab ──────────────────────────────────────
async function loadPageInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrl = tab.url;
  currentFavicon = `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}&sz=32`;
  currentSourceName = new URL(tab.url).hostname.replace(/^www\./, '');

  document.getElementById('urlPreview').textContent = currentUrl;

  // Inject script to read OpenGraph meta tags
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractOpenGraph,
    });

    const og = results[0].result;

    document.getElementById('title').value   = og.title   || tab.title || '';
    document.getElementById('summary').value = og.description || '';

    if (og.image) {
      const preview = document.getElementById('ogPreview');
      const img = document.getElementById('ogImage');
      img.src = og.image;
      preview.style.display = 'block';
    }

    // Use OG site_name if available
    if (og.siteName) currentSourceName = og.siteName;

  } catch (e) {
    // Fallback: just use tab title
    document.getElementById('title').value = tab.title || '';
  }
}

// Runs in page context — reads OG meta tags
function extractOpenGraph() {
  const get = (selector) => {
    const el = document.querySelector(selector);
    return el ? (el.content || el.getAttribute('content') || '') : '';
  };
  return {
    title:       get('meta[property="og:title"]')       || get('meta[name="twitter:title"]')       || document.title,
    description: get('meta[property="og:description"]') || get('meta[name="twitter:description"]') || get('meta[name="description"]'),
    image:       get('meta[property="og:image"]')       || get('meta[name="twitter:image"]'),
    siteName:    get('meta[property="og:site_name"]'),
  };
}

// ── Tags management ───────────────────────────────────────────────────────────
function focusTagInput() {
  document.getElementById('tagInput').focus();
}

function handleTagInput(event) {
  const input = event.target;
  const value = input.value.trim().toLowerCase().replace(/\s+/g, '-');

  if ((event.key === 'Enter' || event.key === ',') && value) {
    event.preventDefault();
    if (!tags.includes(value)) {
      tags.push(value);
      renderTags();
    }
    input.value = '';
  }

  if (event.key === 'Backspace' && input.value === '' && tags.length > 0) {
    tags.pop();
    renderTags();
  }
}

function renderTags() {
  const container = document.getElementById('tagsContainer');
  const input = document.getElementById('tagInput');
  // Remove existing chips
  container.querySelectorAll('.tag-chip').forEach(el => el.remove());
  // Re-add chips before input
  tags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `#${tag} <button onclick="removeTag('${tag}')" title="supprimer">×</button>`;
    container.insertBefore(chip, input);
  });
}

function removeTag(tag) {
  tags = tags.filter(t => t !== tag);
  renderTags();
}

// ── Save link to GitHub ───────────────────────────────────────────────────────
async function saveLink() {
  const title   = document.getElementById('title').value.trim();
  const summary = document.getElementById('summary').value.trim();
  const token   = document.getElementById('githubToken').value.trim();
  const repo    = document.getElementById('githubRepo').value.trim();

  if (!title)  return showStatus('titre requis.', 'err');
  if (!token)  return showStatus('token GitHub manquant — voir ⚙ config.', 'err');
  if (!repo)   return showStatus('repo GitHub manquant — voir ⚙ config.', 'err');

  const btn = document.getElementById('btnSave');
  btn.disabled = true;
  btn.textContent = 'envoi...';

  try {
    // 1. Fetch current links.json from GitHub
    const fileRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/_data/links.json`,
      { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
    );

    let links = [];
    let sha = null;

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
      links = JSON.parse(atob(fileData.content.replace(/\n/g, '')));
    }

    // 2. Build new entry
    const newEntry = {
      id:             Date.now().toString(36),
      url:            currentUrl,
      title:          title,
      summary:        summary,
      source_name:    currentSourceName,
      source_favicon: currentFavicon,
      date:           new Date().toISOString().slice(0, 10),
      added_at:       new Date().toISOString(),
      tags:           tags,
    };

    links.unshift(newEntry);

    // 3. Push updated file
    const body = {
      message: `add link: ${title}`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(links, null, 2)))),
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/_data/links.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(err.message || putRes.statusText);
    }

    showStatus('✓ lien sauvegardé !', 'ok');
    setTimeout(() => window.close(), 1500);

  } catch (e) {
    showStatus('erreur : ' + e.message, 'err');
    btn.disabled = false;
    btn.textContent = '+ sauvegarder';
  }
}

// ── Settings panel toggle ─────────────────────────────────────────────────────
function toggleSettings() {
  const panel = document.getElementById('settingsPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

// ── Status display ────────────────────────────────────────────────────────────
function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status ' + (type || '');
  el.style.display = 'block';
}
