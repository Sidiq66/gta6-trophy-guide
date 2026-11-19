// Rendering: the filter chips, the trophy list, the detail panel and the
// header progress. Everything is built with textContent, never by injecting
// markup, so a trophy name can contain any punctuation PlayStation chose.

import { GRADE_INFO, KIND_INFO, KIND_ORDER } from './data.js';

const TROPHY_CUP_PATH =
  'M5 3h14v2h3v4a5 5 0 0 1-5 5h-.42A6 6 0 0 1 13 17.92V20h4v2H7v-2h4v-2.08A6 6 0 0 1 6.42 14H6a5 5 0 0 1-5-5V5h3V3h1zm14 4v4.5A2.5 2.5 0 0 0 21.5 9V7H19zM5 7H3.5v2A2.5 2.5 0 0 0 6 11.5V7H5z';

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function gradeBadge(trophy) {
  const badge = h('span', `grade-badge grade-${trophy.grade}`);
  // A constant markup string (no trophy data in it): an inline SVG cup,
  // parsed as real SVG by the HTML parser, coloured by the CSS grade class.
  const icon = h('span');
  icon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${TROPHY_CUP_PATH}"/></svg>`;
  badge.append(icon.firstChild, GRADE_INFO[trophy.grade].label.toUpperCase());
  return badge;
}

// A trophy is shielded when the spoiler shield is on, PlayStation keeps it
// secret, and the player has not earned it yet.
export function isShielded(trophy, spoilersOn, isEarned) {
  return spoilersOn && trophy.hidden && !isEarned(trophy.id);
}

export function displayName(trophy, shielded) {
  return shielded ? 'Hidden trophy' : trophy.name;
}

function metaTags(trophy, shielded) {
  const meta = h('span', 'trophy-meta');
  if (shielded) {
    meta.append(h('span', 'tag tag-secret', 'SECRET'));
    return meta;
  }
  meta.append(h('span', 'tag tag-kind', KIND_INFO[trophy.kind].label));
  if (trophy.target) meta.append(h('span', 'tag', `Target ${trophy.target.toLocaleString('en-US')}`));
  if (trophy.hidden) meta.append(h('span', 'tag tag-secret', 'SECRET'));
  if (trophy.missable) meta.append(h('span', 'tag tag-missable', 'MISSABLE'));
  return meta;
}

export function renderChips(container, trophies, activeKind, onPick) {
  container.replaceChildren();
  const counts = new Map();
  for (const t of trophies) counts.set(t.kind, (counts.get(t.kind) ?? 0) + 1);
  const make = (kind, label, count) => {
    const chip = h('button', `chip${activeKind === kind ? ' active' : ''}`);
    chip.type = 'button';
    chip.append(label, h('span', 'chip-count', ` ${count}`));
    chip.addEventListener('click', () => onPick(kind));
    return chip;
  };
  container.append(make('all', 'All', trophies.length));
  for (const kind of KIND_ORDER) {
    if (kind === 'online' || counts.has(kind)) {
      container.append(make(kind, KIND_INFO[kind].label, counts.get(kind) ?? 0));
    }
  }
}

export function filterTrophies(trophies, filters, helpers) {
  const q = filters.q.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.hideEarned && helpers.isEarned(t.id)) return false;
    if (q) {
      if (helpers.isShielded(t)) return false;
      const haystack = `${t.name} ${t.description} ${t.guide} ${KIND_INFO[t.kind].label}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function renderList(listEl, shown, ctx) {
  listEl.replaceChildren();
  for (const t of shown) {
    const shielded = ctx.isShielded(t);
    const earned = ctx.isEarned(t.id);
    const row = h('li', `trophy-row${earned ? ' is-earned' : ''}${ctx.selectedId === t.id ? ' selected' : ''}`);
    row.dataset.id = t.id;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', `Mark ${displayName(t, shielded)} as earned`);
    box.addEventListener('change', () => ctx.onToggle(t.id, box.checked));
    box.addEventListener('click', (e) => e.stopPropagation());

    const nameBlock = h('span');
    nameBlock.append(h('span', 'trophy-name', displayName(t, shielded)));
    nameBlock.append(
      h('span', 'trophy-desc', shielded ? 'Secret on PlayStation until earned.' : t.description),
    );
    nameBlock.append(metaTags(t, shielded));

    const points = h('span', 'trophy-points', `${GRADE_INFO[t.grade].points}`);
    points.append(h('small', null, 'pts'));

    row.append(box, gradeBadge(t), nameBlock, points);
    row.addEventListener('click', () => ctx.onSelect(t.id));
    listEl.append(row);
  }
}

export function renderDetail(panel, trophy, ctx) {
  panel.replaceChildren();
  if (!trophy) {
    panel.append(h('p', 'placeholder-note', 'Pick a trophy from the list to read its guide.'));
    return;
  }
  const earned = ctx.isEarned(trophy.id);
  const shielded = ctx.isShielded(trophy);

  panel.append(gradeBadge(trophy));

  if (shielded) {
    panel.append(h('h2', null, 'Hidden trophy'));
    panel.append(
      h(
        'p',
        'placeholder-note',
        'The spoiler shield is on. This trophy is secret on PlayStation, so its name, description and guide stay covered until you earn it — then mark it here and the cover lifts. You can also switch the shield off in the toolbar to read everything now.',
      ),
    );
    panel.append(earnRow(trophy, earned, ctx));
    return;
  }

  panel.append(h('h2', null, trophy.name));
  panel.append(h('p', 'official', `“${trophy.description}”`));

  const meta = h('div', 'detail-meta');
  meta.append(h('span', 'tag tag-kind', KIND_INFO[trophy.kind].label));
  meta.append(h('span', 'tag', `${GRADE_INFO[trophy.grade].points} points`));
  if (trophy.target) meta.append(h('span', 'tag', `Target ${trophy.target.toLocaleString('en-US')}`));
  meta.append(h('span', 'tag', `Roadmap phase ${trophy.stage}`));
  if (trophy.hidden) meta.append(h('span', 'tag tag-secret', 'SECRET'));
  panel.append(meta);

  if (trophy.missable) {
    const warning = h('div', 'missable-warning');
    const strong = h('strong', null, 'Missable — act in Chapter 1. ');
    warning.append(
      strong,
      'One part of this trophy is only available during Chapter 1 and never comes back. It is the only missable trophy on the list; the guide below gives the moment to catch.',
    );
    panel.append(warning);
  }

  panel.append(h('h3', null, 'Guide'));
  panel.append(h('p', 'guide-text', trophy.guide));

  panel.append(h('h3', null, 'Sources'));
  const list = h('ul', 'sources');
  for (const s of trophy.sources ?? []) {
    const li = h('li');
    const a = h('a', null, s.name);
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a);
    list.append(li);
  }
  panel.append(list);

  panel.append(earnRow(trophy, earned, ctx));
}

function earnRow(trophy, earned, ctx) {
  const row = h('label', 'earn-row');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.addEventListener('change', () => ctx.onToggle(trophy.id, box.checked));
  row.append(box, h('span', null, earned ? 'Earned — nice one.' : 'Mark as earned'));
  return row;
}

export function renderProgress(trophies, tracker) {
  const { count, points } = tracker.summary();
  const totalPts = trophies.reduce((sum, t) => sum + GRADE_INFO[t.grade].points, 0);
  document.getElementById('progress-count').textContent = `${count} of ${trophies.length} earned`;
  document.getElementById('progress-points').textContent = `${points} / ${totalPts} pts`;
  document.getElementById('progress-bar').style.width = `${(count / trophies.length) * 100}%`;
  const note = document.getElementById('progress-note');
  if (count === trophies.length) {
    note.textContent = 'Every trophy earned — you are a Leonida Legend.';
  } else if (count > 0) {
    note.textContent = `${trophies.length - count} to go. Progress is saved in this browser; export it from the toolbar to keep a copy.`;
  } else {
    note.textContent = 'Tick a trophy off and it stays ticked — progress is saved in this browser.';
  }
}
