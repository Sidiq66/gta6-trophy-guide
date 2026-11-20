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
  sort: 'guide',
  hideEarned: false,
  query: '',
  shieldOn: localStorage.getItem(SHIELD_KEY) !== 'off',
  selectedId: null,
  shot: readShot(),
};

// In the tracker and roadmap shot modes the app runs on a fixed demo set
// instead of the reader's real progress, so the screenshots never depend
// on local state.
const demoMode = state.shot.mode === 'tracker' || state.shot.mode === 'roadmap';
const tracker = new Tracker();
if (demoMode) {
  tracker.suspendPersistence();
  tracker.replace(DEMO_EARNED);
}

const els = {
  progress: document.getElementById('progress-slot'),
  chips: document.getElementById('kind-chips'),
  list: document.getElementById('trophy-list'),
  detail: document.getElementById('detail-slot'),
  guideView: document.getElementById('guide-view'),
  roadmapView: document.getElementById('roadmap-slot'),
  search: document.getElementById('search-box'),
  grade: document.getElementById('grade-filter'),
  sort: document.getElementById('sort-select'),
  remaining: document.getElementById('remaining-toggle'),
  shield: document.getElementById('shield-toggle'),
  status: document.getElementById('status-line'),
};

function earnedSet() {
  return tracker.earned;
}

// Opens one trophy in the guide view: the hero's next-up and missable
// alert, and the roadmap's chips, all land here.
function openTrophy(id) {
  state.selectedId = id;
  setView('guide');
}

const GRADE_RANK = { bronze: 0, silver: 1, gold: 2, platinum: 3 };

function visibleTrophies() {
  const q = state.query.trim().toLowerCase();
  const rows = state.trophies.filter((trophy) => {
    if (state.kind !== 'all' && trophy.kind !== state.kind) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.hideEarned && tracker.has(trophy.id)) return false;
    if (!q) return true;
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    return haystack.includes(q);
  });
  if (state.sort === 'name') {
    rows.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sort === 'grade') {
    rows.sort((a, b) => (GRADE_RANK[b.grade] - GRADE_RANK[a.grade]) || (b.points - a.points));
  } else if (state.sort === 'points') {
    rows.sort((a, b) => b.points - a.points);
  }
  return rows;
}

function renderProgress() {
  els.progress.replaceChildren(progressSummary(state.trophies, tracker.earned, openTrophy));
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
  els.roadmapView.replaceChildren(roadmapView(state.byId, earnedSet(), openTrophy));
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

  els.sort.addEventListener('change', () => {
    state.sort = els.sort.value;
    renderList();
  });

  els.remaining.addEventListener('change', () => {
    state.hideEarned = els.remaining.checked;
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

// Applies the fixed screenshot states after the first render. A shot may
// pin the spoiler shield (&shield=on|off) and the open trophy
// (&trophy=<id>) so each frame shows exactly the state it means to prove:
// the list and detail shots run with the shield off, so the official
// names and descriptions are what the frame is full of, while the
// tracker shot keeps the shield on, with the demo set earned, so masked
// and revealed secret trophies sit side by side.
function applyShot() {
  const { mode, trophy, shield } = state.shot;
  if (shield === 'on' || shield === 'off') {
    state.shieldOn = shield === 'on';
    els.shield.checked = state.shieldOn;
  }
  if (mode === 'roadmap') {
    setView('roadmap');
    // Frame the phases themselves, not just the preamble: scroll so the
    // missable banner and the first phase block share the shot.
    requestAnimationFrame(() => {
      const anchor = els.roadmapView.querySelector('.roadmap-missable')
        ?? els.roadmapView.querySelector('.phase');
      if (anchor) {
        const y = anchor.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo(0, Math.max(0, y));
      }
      markShotReady();
    });
    return;
  }
    if (state.byId.has(trophy)) state.selectedId = trophy;
    else if (mode === 'detail') state.selectedId = 'positive-mental-attitude';
    else if (!state.selectedId) state.selectedId = state.trophies[0]?.id ?? null;
    setView('guide');
    if (mode === 'detail') {
      // Settle the sticky detail panel at the top of the frame so the
      // whole panel — warning, steps, guide, sources — is in the shot.
      requestAnimationFrame(() => {
        const panel = els.detail.querySelector('.detail');
        if (panel) {
          const y = panel.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo(0, Math.max(0, y));
        }
        markShotReady();
      });
      return;
    }
  markShotReady();
}

async function boot() {
  if (state.shot.mode) document.body.classList.add('shot-mode');
  if (state.shot.mode === 'list' || state.shot.mode === 'detail') {
    document.body.classList.add('shot-tight');
  }
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
