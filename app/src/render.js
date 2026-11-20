// Leonida Ledger — rendering.
//
// Every view is built here from plain DOM calls, so the page never needs a
// framework or a build step. main.js owns the state; this module only
// turns state into elements.

import { GRADE_LABEL, KIND_LABEL, shownDescription, shownName } from './data.js';
import {
  FREE_ROAM_INTRO,
  PHASES,
  ROADMAP_FACTS,
  ROADMAP_INTRO,
  ROADMAP_SOURCES,
} from './roadmap.js';

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
// The card carries its grade as a class so the left stripe can wear the
// grade's colour: the whole list reads as grades at a glance.
export function trophyCard(trophy, { earned, earnedIds, shieldOn, selected, onToggle, onOpen }) {
  const card = el('article', `card grade-${trophy.grade}`);
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

  if (masked) {
    panel.append(el('h3', 'detail-sub', 'Guide'));
    panel.append(el('p', 'detail-guide',
      'The guide for this trophy stays behind the spoiler shield until ' +
      'you earn it, because even its official description is a spoiler.'));
  } else {
    if (Array.isArray(trophy.steps) && trophy.steps.length) {
      panel.append(el('h3', 'detail-sub', 'How to earn it'));
      const steps = el('ol', 'steps');
      for (const step of trophy.steps) {
        steps.append(el('li', 'step', step));
      }
      panel.append(steps);
    }
    panel.append(el('h3', 'detail-sub', 'Guide'));
    panel.append(el('p', 'detail-guide', trophy.guide));
    if (trophy.tip) {
      const tip = el('p', 'tip');
      tip.append(el('strong', 'tip-label', 'Field tip: '), document.createTextNode(trophy.tip));
      panel.append(tip);
    }
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

// The order the roadmap banks trophies in: the five phases flattened,
// then everything the phases leave to free-roam, in list order. The hero
// uses it to name the next trophy on the road.
export function roadmapOrder(trophies) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const ordered = [];
  const placed = new Set();
  for (const phase of PHASES) {
    for (const id of phase.trophies) {
      if (byId.has(id) && !placed.has(id)) {
        ordered.push(byId.get(id));
        placed.add(id);
      }
    }
  }
  for (const trophy of trophies) {
    if (!placed.has(trophy.id)) ordered.push(trophy);
  }
  return ordered;
}

function phaseLabelFor(id) {
  for (const phase of PHASES) {
    if (phase.trophies.includes(id)) return `Phase ${phase.n}`;
  }
  return 'Free-roam sweep';
}

// Header hero: the state of the platinum run at a glance. The big line
// and bar, a pip per grade, the next trophy the roadmap would bank, and
// — while it is still unearned — the one missable moment flagged in red,
// because Chapter 1 is the only place the run can actually be lost.
export function progressSummary(trophies, earned, onOpen) {
  const wrap = el('div', 'progress');
  let count = 0;
  let points = 0;
  let totalPoints = 0;
  const gradeTotal = {};
  const gradeEarned = {};
  for (const trophy of trophies) {
    totalPoints += trophy.points;
    gradeTotal[trophy.grade] = (gradeTotal[trophy.grade] ?? 0) + 1;
    if (earned.has(trophy.id)) {
      count += 1;
      points += trophy.points;
      gradeEarned[trophy.grade] = (gradeEarned[trophy.grade] ?? 0) + 1;
    }
  }
  const percent = trophies.length ? Math.round((count / trophies.length) * 100) : 0;

  wrap.append(el('p', 'progress-kicker', 'Your road to the platinum'));
  wrap.append(el('p', 'progress-line',
    `${count} of ${trophies.length} trophies · ${points} of ${totalPoints} points · ${percent}%`));
  const bar = el('div', 'progress-bar');
  const fill = el('div', 'progress-fill');
  fill.style.width = `${percent}%`;
  bar.append(fill);
  wrap.append(bar);

  const pips = el('div', 'grade-pips');
  for (const grade of ['bronze', 'silver', 'gold', 'platinum']) {
    if (!gradeTotal[grade]) continue;
    pips.append(el('span', `pip grade-${grade}`,
      `${GRADE_LABEL[grade]} ${gradeEarned[grade] ?? 0}/${gradeTotal[grade]}`));
  }
  wrap.append(pips);

  const missable = trophies.find((t) => t.missable);
  if (missable && !earned.has(missable.id)) {
    const alert = el('button', 'missable-alert',
      `\u26A0 Missable still open: ${missable.name} — the Chapter 1 moment cannot be replayed`);
    alert.type = 'button';
    alert.addEventListener('click', () => onOpen(missable.id));
    wrap.append(alert);
  }

  const next = roadmapOrder(trophies).find((t) => !earned.has(t.id) && t.grade !== 'platinum');
  if (next) {
    const line = el('p', 'next-up');
    line.append(
      el('span', 'next-up-label', 'Next on the road: '),
      document.createTextNode(`${next.name} (${phaseLabelFor(next.id)})`),
    );
    const jump = el('button', 'next-up-btn', 'Open its guide');
    jump.type = 'button';
    jump.addEventListener('click', () => onOpen(next.id));
    line.append(jump);
    wrap.append(line);
  } else if (count === trophies.length) {
    wrap.append(el('p', 'next-up', 'The ledger is closed: every trophy earned. Vice Got a Price!'));
  }
  return wrap;
}

// The roadmap view: a one-line summary of the whole path, the headline
// facts, a missable banner while the Chapter 1 moment is still open, the
// two disciplines (saves, cheats), then the five phases with the trophies
// each one banks and a live count of how many are already in. A closing
// block sweeps up every trophy the phases leave to free-roam, so all 55
// are accounted for on this page.
export function roadmapView(trophiesById, earned, onOpen) {
  const view = el('section', 'roadmap');
  view.append(el('h2', 'roadmap-title', 'The road to the platinum'));
  view.append(el('p', 'roadmap-intro', ROADMAP_INTRO));

  const all = [...trophiesById.values()];
  const bankedTotal = all.filter((t) => earned.has(t.id)).length;
  view.append(el('p', 'path-summary',
    `The whole path: 5 phases · ~200 hours · 1 playthrough · ${bankedTotal} of ` +
    `${all.length} trophies banked so far · 1 missable moment, and it lives in Phase 1.`));

  const facts = el('dl', 'roadmap-facts');
  for (const fact of ROADMAP_FACTS) {
    const cell = el('div', 'fact');
    cell.append(el('dt', '', fact.label), el('dd', '', fact.value));
    facts.append(cell);
  }
  view.append(facts);

  const missable = all.find((t) => t.missable);
  if (missable && !earned.has(missable.id)) {
    const banner = el('p', 'roadmap-missable',
      `Before anything else: ${missable.name} can be lost for good in Chapter 1. ` +
      'Keep a manual save at the chapter\u2019s start, and meditate with Lucia at ' +
      'Jason\u2019s house when she offers, after Down to Earth.');
    const open = el('button', 'next-up-btn', 'Open its guide');
    open.type = 'button';
    open.addEventListener('click', () => onOpen(missable.id));
    banner.append(open);
    view.append(banner);
  }

  const placed = new Set();
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
    let banked = 0;
    let phasePoints = 0;
    let bankedPoints = 0;
    for (const id of phase.trophies) {
      const trophy = trophiesById.get(id);
      if (!trophy) continue;
      placed.add(id);
      phasePoints += trophy.points;
      if (earned.has(id)) {
        banked += 1;
        bankedPoints += trophy.points;
      }
      const chip = el('button', 'phase-chip', trophy.name);
      chip.type = 'button';
      if (earned.has(id)) chip.classList.add('is-earned');
      chip.addEventListener('click', () => onOpen(id));
      chips.append(chip);
    }
    block.append(chips);
    const total = phase.trophies.length;
    const meter = el('div', 'phase-meter');
    const meterFill = el('div', 'phase-meter-fill');
    meterFill.style.width = total ? `${Math.round((banked / total) * 100)}%` : '0%';
    meter.append(meterFill);
    block.append(meter, el('p', 'phase-banked',
      `${banked} of ${total} banked · ${bankedPoints} of ${phasePoints} points`));
    view.append(block);
  }

  const rest = all.filter((t) => !placed.has(t.id));
  if (rest.length) {
    const block = el('article', 'phase phase-freeroam');
    const head = el('div', 'phase-head');
    head.append(
      el('span', 'phase-n', 'Any time'),
      el('h3', 'phase-title', 'The open ledger — free-roam sweeps'),
      el('span', 'phase-hours', 'no fixed order'),
    );
    block.append(head, el('p', 'phase-text', FREE_ROAM_INTRO));
    const chips = el('div', 'phase-trophies');
    let banked = 0;
    for (const trophy of rest) {
      if (earned.has(trophy.id)) banked += 1;
      const chip = el('button', 'phase-chip', trophy.name);
      chip.type = 'button';
      if (earned.has(trophy.id)) chip.classList.add('is-earned');
      chip.addEventListener('click', () => onOpen(trophy.id));
      chips.append(chip);
    }
    block.append(chips);
    block.append(el('p', 'phase-banked',
      `${banked} of ${rest.length} banked · every one of the 55 is now on this page`));
    view.append(block);
  }

  const sources = el('p', 'roadmap-sources',
    'Roadmap facts rest on: ' +
    ROADMAP_SOURCES.map((s) => `${s.name} (${s.url})`).join('; ') + '.');
  view.append(sources);
  return view;
}
