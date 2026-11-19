// Boot and wiring: load the data, build the tracker, connect the toolbar,
// tabs, list, detail panel and roadmap, then apply any ?shot= state.

import { collectSources, loadGuide, trophyById } from './data.js';
import { createTracker, downloadProgress } from './tracker.js';
import {
  displayName,
  filterTrophies,
  isShielded,
  renderChips,
  renderDetail,
  renderList,
  renderProgress,
} from './render.js';
import { renderRoadmap } from './roadmap.js';
import { markShotReady, planShot } from './shots.js';

const els = {
  tabGuide: document.getElementById('tab-guide'),
  tabRoadmap: document.getElementById('tab-roadmap'),
  viewGuide: document.getElementById('view-guide'),
  viewRoadmap: document.getElementById('view-roadmap'),
  search: document.getElementById('search'),
  chips: document.getElementById('kind-chips'),
  grade: document.getElementById('grade-filter'),
  spoilers: document.getElementById('spoiler-toggle'),
  hideEarned: document.getElementById('earned-toggle'),
  exportBtn: document.getElementById('export-btn'),
  importInput: document.getElementById('import-input'),
  summary: document.getElementById('list-summary'),
  list: document.getElementById('trophy-list'),
  detail: document.getElementById('detail'),
  roadmap: document.getElementById('roadmap'),
};

const filters = { q: '', kind: 'all', grade: 'all', hideEarned: false };
let trophies = [];
let sources = [];
let tracker = null;
let selectedId = 'a-long-road';
let view = 'guide';

const isEarned = (id) => tracker.isEarned(id);
const shielded = (t) => isShielded(t, tracker.spoilersOn(), isEarned);

function showView(name) {
  view = name;
  els.viewGuide.hidden = name !== 'guide';
  els.viewRoadmap.hidden = name !== 'roadmap';
  els.tabGuide.classList.toggle('active', name === 'guide');
  els.tabRoadmap.classList.toggle('active', name === 'roadmap');
}

function renderAll() {
  renderProgress(trophies, tracker);
  renderChips(els.chips, trophies, filters.kind, (kind) => {
    filters.kind = kind;
    renderAll();
  });
  const shown = filterTrophies(trophies, filters, { isEarned, isShielded: shielded });
  let note = `Showing ${shown.length} of ${trophies.length} trophies.`;
  if (filters.kind === 'online' && shown.length === 0) {
    note += ' GTA VI has no online trophies — the whole list is single-player.';
  }
  els.summary.textContent = note;
  renderList(els.list, shown, {
    selectedId,
    isEarned,
    isShielded: shielded,
    onToggle,
    onSelect: (id) => {
      selectedId = id;
      renderAll();
    },
  });
  renderDetail(els.detail, trophyById(trophies, selectedId), {
    isEarned,
    isShielded: shielded,
    onToggle,
  });
  renderRoadmap(els.roadmap, {
    trophies,
    tracker,
    sources,
    nameFor: (t) => displayName(t, shielded(t)),
    onPick: (t) => {
      selectedId = t.id;
      showView('guide');
      renderAll();
    },
  });
}

function onToggle(id, on) {
  tracker.setEarned(id, on);
  renderAll();
}

function wire() {
  els.tabGuide.addEventListener('click', () => showView('guide'));
  els.tabRoadmap.addEventListener('click', () => showView('roadmap'));
  els.search.addEventListener('input', () => {
    filters.q = els.search.value;
    renderAll();
  });
  els.grade.addEventListener('change', () => {
    filters.grade = els.grade.value;
    renderAll();
  });
  els.spoilers.checked = tracker.spoilersOn();
  els.spoilers.addEventListener('change', () => {
    tracker.setSpoilers(els.spoilers.checked);
    renderAll();
  });
  els.hideEarned.addEventListener('change', () => {
    filters.hideEarned = els.hideEarned.checked;
    renderAll();
  });
  els.exportBtn.addEventListener('click', () => downloadProgress(tracker));
  els.importInput.addEventListener('change', async () => {
    const file = els.importInput.files?.[0];
    if (!file) return;
    try {
      const count = tracker.importText(await file.text());
      renderAll();
      els.summary.textContent = `Imported progress: ${count} trophies marked earned.`;
    } catch {
      els.summary.textContent = 'That file could not be read as a Leonida Ledger progress file.';
    }
    els.importInput.value = '';
  });
}

async function boot() {
  const loaded = await loadGuide();
  trophies = loaded.trophies;
  sources = collectSources(trophies);
  tracker = createTracker(trophies);
  wire();

  const plan = planShot(location.search);
  if (plan) {
    if (plan.seedEarned) tracker.seed(plan.seedEarned);
    if (plan.selectedId && trophyById(trophies, plan.selectedId)) selectedId = plan.selectedId;
    if (plan.view) showView(plan.view);
  }
  renderAll();
  markShotReady();
}

boot().catch((err) => {
  els.detail.textContent = `The guide data failed to load: ${err.message}`;
  markShotReady();
});
