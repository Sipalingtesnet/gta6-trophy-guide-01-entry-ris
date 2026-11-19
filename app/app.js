// GTA VI trophy guide — offline checklist front end. No dependencies, no network
// beyond the local trophy data.
const DATA_URL = 'data/trophies.json';
const STORAGE_KEY = 'gta6-trophy-checklist';
const TOTAL = 55;

const ui = {
  progress: document.getElementById('progress'),
  grade: document.getElementById('grade'),
  kind: document.getElementById('kind'),
  earned: document.getElementById('earned'),
  missable: document.getElementById('missable'),
  spoilers: document.getElementById('spoilers'),
  search: document.getElementById('search'),
  export: document.getElementById('export'),
  import: document.getElementById('import'),
  rows: document.getElementById('rows'),
};

let trophies = [];
let banner = '';
const earnedNames = loadEarned();

function loadEarned() {
  const names = new Set();
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return names;
  }
  if (!raw) return names;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const name of parsed) {
        if (typeof name === 'string') names.add(name);
      }
    }
  } catch {
    return new Set();
  }
  return names;
}

function saveEarned() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedNames]));
  } catch {
    // Private mode or a full quota: the checklist still works for this visit.
  }
}

function activeFilters() {
  return {
    grade: ui.grade.value,
    kind: ui.kind.value,
    earned: ui.earned.value,
    missableOnly: ui.missable.checked,
    spoilers: ui.spoilers.checked,
    query: ui.search.value.trim().toLowerCase(),
  };
}

function matches(trophy, filters) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;

  const isEarned = earnedNames.has(trophy.name);
  if (filters.earned === 'earned' && !isEarned) return false;
  if (filters.earned === 'unearned' && isEarned) return false;

  if (filters.missableOnly && trophy.missable !== true) return false;

  if (filters.query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(filters.query)) return false;
  }
  return true;
}

function chip(text, extra) {
  const span = document.createElement('span');
  span.className = 'badge';
  if (extra) span.classList.add(extra);
  span.textContent = text;
  return span;
}

function buildCard(trophy, filters) {
  const isEarned = earnedNames.has(trophy.name);
  const isSpoiler = trophy.story === true && filters.spoilers && !isEarned;

  const card = document.createElement('article');
  card.className = 'trophy';
  card.dataset.earned = String(isEarned);
  if (isSpoiler) card.classList.add('spoiler');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.id = `trophy-${trophy.id}`;
  box.checked = isEarned;
  box.setAttribute(
    'aria-label',
    isSpoiler ? 'Mark this hidden story trophy as earned' : `Mark "${trophy.name}" as earned`
  );
  box.addEventListener('change', () => setEarned(trophy.name, box.checked));

  const name = document.createElement('h3');
  name.className = 'trophy-name';
  name.textContent = isSpoiler ? 'Hidden story trophy' : trophy.name;

  const meta = document.createElement('p');
  meta.className = 'trophy-meta';
  const grade = chip(trophy.grade);
  grade.dataset.grade = trophy.grade;
  meta.append(grade);
  if (trophy.missable) meta.append(chip('missable', 'missable'));
  if (trophy.story && !isSpoiler) meta.append(chip('story', 'story'));

  card.append(box, name, meta);

  if (isSpoiler) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent =
      'Its name, description and guide stay hidden until you earn it, or until you turn off "Show story spoilers". Ticking the box reveals it.';
    card.append(note);
    return card;
  }

  const description = document.createElement('p');
  description.className = 'description';
  description.textContent = trophy.description;

  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = trophy.guide;

  const source = document.createElement('span');
  source.className = 'source';
  source.textContent = `Source: ${trophy.source}`;

  card.append(description, guide, source);
  return card;
}

function setEarned(name, on) {
  if (on) earnedNames.add(name);
  else earnedNames.delete(name);
  saveEarned();
  render();
}

function render() {
  const filters = activeFilters();

  const count = trophies.filter((trophy) => earnedNames.has(trophy.name)).length;
  ui.progress.textContent = `${count} of ${TOTAL} earned`;

  const visible = trophies.filter((trophy) => matches(trophy, filters));
  const fragment = document.createDocumentFragment();

  if (visible.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'loading';
    empty.textContent = banner || 'No trophies match these filters.';
    fragment.append(empty);
  } else {
    for (const trophy of visible) fragment.append(buildCard(trophy, filters));
  }

  ui.rows.replaceChildren(fragment);
  ui.rows.setAttribute('aria-busy', 'false');

  const listed = document.createElement('p');
  listed.className = 'loading';
  listed.textContent = `${visible.length} of ${trophies.length} trophies shown`;
  listed.setAttribute('role', 'status');
  ui.rows.append(listed);
}

function renderLoadError(message) {
  ui.progress.textContent = '0 of 55 earned';
  const error = document.createElement('p');
  error.className = 'loading';
  error.textContent = message;
  ui.rows.replaceChildren(error);
  ui.rows.setAttribute('aria-busy', 'false');
}

function downloadProgress() {
  const names = trophies.filter((t) => earnedNames.has(t.name)).map((t) => t.name);
  const blob = new Blob([JSON.stringify(names, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'trophy-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function importProgress(file) {
  if (!file) return;
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    banner = 'That file is not valid JSON, so the checklist was left alone.';
    render();
    return;
  }
  const names = Array.isArray(parsed)
    ? parsed
    : parsed && Array.isArray(parsed.trophies)
      ? parsed.trophies
      : parsed && Array.isArray(parsed.earned)
        ? parsed.earned
        : null;

  if (!names) {
    banner = 'Expected a JSON array of trophy names, so the checklist was left alone.';
    render();
    return;
  }

  const known = new Set(trophies.map((t) => t.name));
  const imported = names.filter((name) => typeof name === 'string' && known.has(name));

  earnedNames.clear();
  for (const name of imported) earnedNames.add(name);
  saveEarned();
  banner = '';
  render();
}

function wire() {
  ui.grade.addEventListener('change', render);
  ui.kind.addEventListener('change', render);
  ui.earned.addEventListener('change', render);
  ui.missable.addEventListener('change', render);
  ui.spoilers.addEventListener('change', render);
  ui.search.addEventListener('input', render);
  ui.export.addEventListener('click', downloadProgress);
  ui.import.addEventListener('change', () => {
    const file = ui.import.files && ui.import.files[0];
    importProgress(file).finally(() => {
      ui.import.value = '';
    });
  });
}

async function boot() {
  wire();
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.trophies)) throw new Error('Unexpected trophy data');
    trophies = data.trophies;
    render();
  } catch (error) {
    renderLoadError(
      `The trophy list could not be loaded (${error.message}). Serve this folder over HTTP — opening index.html from disk blocks the data fetch.`
    );
  }
}

boot();
