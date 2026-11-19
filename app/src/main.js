// Leonida Ledger — the guide UI.
//
// Wires the pieces together: loads the trophy data, keeps the filter and
// selection state, renders the checklist with its detail panel, the
// roadmap, and the tracker header, and applies the fixed ?shot= states
// the screenshots are taken from.

import { GRADE_LABEL, KINDS, loadGuideData } from './data.js';
import { Tracker } from './tracker.js';
import { detailPanel, progressSummary, roadmapView, trophyCard } from './render.js';
import { DEMO_EARNED, markShotReady, readShot } from './shots.js';

const SHIELD_KEY = 'leonida-ledger.shield.v1';

const state = {
  trophies: [],
  byId: new Map(),
  view: 'guide',           // 'guide' | 'roadmap'
  kind: 'all',
  grade: 'all',
  query: '',
  shieldOn: localStorage.getItem(SHIELD_KEY) !== 'off',
  selectedId: null,
  shot: readShot(),
};

// In tracker shot mode the app runs on a fixed demo set instead of the
// reader's real progress, so the screenshot never depends on local state.
const demoMode = state.shot.mode === 'tracker';
const tracker = new Tracker();
if (demoMode) tracker.replace(DEMO_EARNED);

const els = {
  progress: document.getElementById('progress-slot'),
  chips: document.getElementById('kind-chips'),
  list: document.getElementById('trophy-list'),
  detail: document.getElementById('detail-slot'),
  guideView: document.getElementById('guide-view'),
  roadmapView: document.getElementById('roadmap-slot'),
  search: document.getElementById('search-box'),
  grade: document.getElementById('grade-filter'),
  shield: document.getElementById('shield-toggle'),
  status: document.getElementById('status-line'),
};

function earnedSet() {
  return tracker.earned;
}

function visibleTrophies() {
  const q = state.query.trim().toLowerCase();
  return state.trophies.filter((trophy) => {
    if (state.kind !== 'all' && trophy.kind !== state.kind) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (!q) return true;
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    return haystack.includes(q);
  });
}

function renderProgress() {
  els.progress.replaceChildren(progressSummary(tracker.summary(state.trophies)));
}

function renderChips() {
  els.chips.replaceChildren(...KINDS.map((kind) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (state.kind === kind.id ? ' is-active' : '');
    const count = kind.id === 'all'
      ? state.trophies.length
      : state.trophies.filter((t) => t.kind === kind.id).length;
    chip.textContent = `${kind.label} · ${count}`;
    chip.addEventListener('click', () => {
      state.kind = kind.id;
      renderGuide();
    });
    return chip;
  }));
}

function renderList() {
  const rows = visibleTrophies();
  if (!rows.length) {
    els.list.replaceChildren(Object.assign(document.createElement('p'), {
      className: 'empty-note',
      textContent: 'No trophies match that filter. GTA VI has no online trophies, ' +
        'so the Online chip is an empty shelf by design.',
    }));
  } else {
    els.list.replaceChildren(...rows.map((trophy) => trophyCard(trophy, {
      earned: tracker.has(trophy.id),
      earnedIds: earnedSet(),
      shieldOn: state.shieldOn,
      selected: trophy.id === state.selectedId,
      onToggle: (id) => tracker.toggle(id),
      onOpen: (id) => {
        state.selectedId = id;
        renderGuide();
      },
    })));
  }
  const shown = rows.length;
  els.status.textContent = shown === state.trophies.length
    ? `Showing all ${shown} trophies.`
    : `Showing ${shown} of ${state.trophies.length} trophies.`;
}

function renderDetail() {
  const trophy = state.byId.get(state.selectedId) ?? state.trophies[0];
  if (!trophy) return;
  state.selectedId = trophy.id;
  els.detail.replaceChildren(detailPanel(trophy, {
    earned: tracker.has(trophy.id),
    shieldOn: state.shieldOn,
    onToggle: (id) => tracker.toggle(id),
  }));
}

function renderGuide() {
  renderProgress();
  renderChips();
  renderList();
  renderDetail();
}

function renderRoadmap() {
  renderProgress();
  els.roadmapView.replaceChildren(roadmapView(state.byId, earnedSet(), (id) => {
    state.selectedId = id;
    setView('guide');
  }));
}

function setView(view) {
  state.view = view;
  els.guideView.hidden = view !== 'guide';
  els.roadmapView.hidden = view !== 'roadmap';
  document.getElementById('tab-guide').classList.toggle('is-active', view === 'guide');
  document.getElementById('tab-roadmap').classList.toggle('is-active', view === 'roadmap');
  if (view === 'roadmap') renderRoadmap();
  else renderGuide();
}

function wireControls() {
  document.getElementById('tab-guide').addEventListener('click', () => setView('guide'));
  document.getElementById('tab-roadmap').addEventListener('click', () => setView('roadmap'));

  els.search.addEventListener('input', () => {
    state.query = els.search.value;
    renderList();
  });

  for (const grade of ['all', 'bronze', 'silver', 'gold', 'platinum']) {
    const option = document.createElement('option');
    option.value = grade;
    option.textContent = grade === 'all' ? 'All grades' : GRADE_LABEL[grade];
    els.grade.append(option);
  }
  els.grade.addEventListener('change', () => {
    state.grade = els.grade.value;
    renderList();
  });

  els.shield.checked = state.shieldOn;
  els.shield.addEventListener('change', () => {
    state.shieldOn = els.shield.checked;
    localStorage.setItem(SHIELD_KEY, state.shieldOn ? 'on' : 'off');
    renderGuide();
  });

  document.getElementById('export-btn').addEventListener('click', () => tracker.exportToFile());
  const importInput = document.getElementById('import-input');
  document.getElementById('import-btn').addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    try {
      const n = await tracker.importFromFile(file, new Set(state.byId.keys()));
      els.status.textContent = `Imported progress: ${n} trophies marked as earned.`;
    } catch {
      els.status.textContent = 'That file did not parse as a Leonida Ledger export.';
    }
    importInput.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => tracker.clear());

  tracker.subscribe(() => {
    if (state.view === 'guide') renderGuide();
    else renderRoadmap();
  });
}

// Applies the fixed screenshot states after the first render.
function applyShot() {
  const { mode, trophy } = state.shot;
  if (mode === 'detail') {
    state.selectedId = state.byId.has(trophy) ? trophy : 'positive-mental-attitude';
    setView('guide');
  } else if (mode === 'roadmap') {
    setView('roadmap');
  } else if (mode === 'tracker' || mode === 'list') {
    state.selectedId = state.trophies[0]?.id ?? null;
    setView('guide');
  }
  markShotReady();
}

async function boot() {
  const data = await loadGuideData();
  state.trophies = data.trophies;
  state.byId = new Map(data.trophies.map((t) => [t.id, t]));
  state.selectedId = data.trophies[0]?.id ?? null;
  wireControls();
  renderGuide();
  applyShot();
}

boot().catch((error) => {
  els.status.textContent = `The guide data failed to load: ${error.message}`;
});
