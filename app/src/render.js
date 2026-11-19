// Leonida Ledger — rendering.
//
// Every view is built here from plain DOM calls, so the page never needs a
// framework or a build step. main.js owns the state; this module only
// turns state into elements.

import { GRADE_LABEL, KIND_LABEL, shownDescription, shownName } from './data.js';
import { PHASES, ROADMAP_FACTS, ROADMAP_INTRO, ROADMAP_SOURCES } from './roadmap.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function gradeBadge(trophy) {
  const badge = el('span', `badge grade-${trophy.grade}`, GRADE_LABEL[trophy.grade]);
  badge.title = `${trophy.points} PlayStation points`;
  return badge;
}

export function kindBadge(trophy) {
  return el('span', 'badge kind', KIND_LABEL[trophy.kind] ?? trophy.kind);
}

// One row of the checklist. Clicking the row opens the trophy's detail;
// the checkbox at its left is the tracker control. earnedIds is the live
// earned set, used to decide whether a secret trophy may show its name.
export function trophyCard(trophy, { earned, earnedIds, shieldOn, selected, onToggle, onOpen }) {
  const card = el('article', 'card');
  if (earned) card.classList.add('is-earned');
  if (selected) card.classList.add('is-selected');
  card.dataset.trophyId = trophy.id;

  const check = el('input', 'card-check');
  check.type = 'checkbox';
  check.checked = earned;
  check.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  check.addEventListener('change', () => onToggle(trophy.id));
  check.addEventListener('click', (event) => event.stopPropagation());

  const body = el('div', 'card-body');
  const titleRow = el('div', 'card-title-row');
  titleRow.append(el('h3', 'card-name', shownName(trophy, earnedIds, shieldOn)));
  if (trophy.missable) titleRow.append(el('span', 'badge missable', 'Missable'));
  if (trophy.secret) titleRow.append(el('span', 'badge secret', 'Secret'));
  body.append(titleRow);
  body.append(el('p', 'card-desc', shownDescription(trophy, earnedIds, shieldOn)));

  const meta = el('div', 'card-meta');
  meta.append(gradeBadge(trophy), kindBadge(trophy), el('span', 'points', `${trophy.points} pts`));
  body.append(meta);

  card.append(check, body);
  card.addEventListener('click', () => onOpen(trophy.id));
  return card;
}

// The detail panel: official description first, then the missable warning
// where one applies, then our own-words guide and the sources it rests on.
export function detailPanel(trophy, { earned, shieldOn, onToggle }) {
  const panel = el('section', 'detail');
  panel.setAttribute('aria-live', 'polite');
  const masked = shieldOn && trophy.secret && !earned;

  const head = el('div', 'detail-head');
  head.append(el('h2', 'detail-name', masked ? 'Hidden trophy' : trophy.name));
  const flags = el('div', 'detail-flags');
  flags.append(gradeBadge(trophy), kindBadge(trophy));
  if (trophy.missable) flags.append(el('span', 'badge missable', 'Missable'));
  if (trophy.secret) flags.append(el('span', 'badge secret', 'Secret'));
  flags.append(el('span', 'points', `${trophy.points} pts`));
  head.append(flags);
  panel.append(head);

  panel.append(el('h3', 'detail-sub', 'Official description'));
  panel.append(el('p', 'detail-desc',
    masked ? 'Hidden on PlayStation until earned.' : trophy.description));

  if (trophy.missable) {
    panel.append(el('p', 'missable-warning',
      'Missable: the Chapter 1 meditation at Jason\u2019s house becomes ' +
      'permanently unavailable after Chapter 1. Do it when Lucia offers, ' +
      'and keep a manual save at the start of the chapter.'));
  }

  panel.append(el('h3', 'detail-sub', 'Guide'));
  if (masked) {
    panel.append(el('p', 'detail-guide',
      'The guide for this trophy stays behind the spoiler shield until ' +
      'you earn it, because even its official description is a spoiler.'));
  } else {
    panel.append(el('p', 'detail-guide', trophy.guide));
    panel.append(el('h3', 'detail-sub', 'Sources'));
    const list = el('ul', 'sources');
    for (const source of trophy.sources ?? []) {
      list.append(el('li', 'source', `${source.name} — ${source.url}`));
    }
    panel.append(list);
  }

  const label = el('label', 'detail-earned');
  const box = el('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.addEventListener('change', () => onToggle(trophy.id));
  label.append(box, document.createTextNode(' I have earned this trophy'));
  panel.append(label);
  return panel;
}

// Header summary: earned count, points and the progress bar.
export function progressSummary(summary) {
  const wrap = el('div', 'progress');
  const line = el('p', 'progress-line',
    `${summary.count} of ${summary.total} trophies · ${summary.points} of ` +
    `${summary.totalPoints} points · ${summary.percent}%`);
  const bar = el('div', 'progress-bar');
  const fill = el('div', 'progress-fill');
  fill.style.width = `${summary.percent}%`;
  bar.append(fill);
  wrap.append(line, bar);
  return wrap;
}

// The roadmap view: headline facts, the two disciplines (saves, cheats),
// then the five phases with the trophies each one banks.
export function roadmapView(trophiesById, earned, onOpen) {
  const view = el('section', 'roadmap');
  view.append(el('h2', 'roadmap-title', 'The road to the platinum'));
  view.append(el('p', 'roadmap-intro', ROADMAP_INTRO));

  const facts = el('dl', 'roadmap-facts');
  for (const fact of ROADMAP_FACTS) {
    const cell = el('div', 'fact');
    cell.append(el('dt', '', fact.label), el('dd', '', fact.value));
    facts.append(cell);
  }
  view.append(facts);

  for (const phase of PHASES) {
    const block = el('article', 'phase');
    const head = el('div', 'phase-head');
    head.append(
      el('span', 'phase-n', `Phase ${phase.n}`),
      el('h3', 'phase-title', phase.title),
      el('span', 'phase-hours', phase.hours),
    );
    block.append(head, el('p', 'phase-text', phase.text));
    const chips = el('div', 'phase-trophies');
    for (const id of phase.trophies) {
      const trophy = trophiesById.get(id);
      if (!trophy) continue;
      const chip = el('button', 'phase-chip', trophy.name);
      chip.type = 'button';
      if (earned.has(id)) chip.classList.add('is-earned');
      chip.addEventListener('click', () => onOpen(id));
      chips.append(chip);
    }
    block.append(chips);
    view.append(block);
  }

  const sources = el('p', 'roadmap-sources',
    'Roadmap facts rest on: ' +
    ROADMAP_SOURCES.map((s) => `${s.name} (${s.url})`).join('; ') + '.');
  view.append(sources);
  return view;
}
