// The platinum roadmap: five phases, written for this guide from the
// official descriptions and the roadmap facts the cited guides agree on
// (one playthrough, a five-chapter story, a lenient 100% checklist).
// Each phase names the trophies a player typically banks during it; the
// phase number matches the "stage" field in app/data/trophies.json.

export const ROADMAP_PHASES = [
  {
    stage: 1,
    title: 'Chapter 1 — settle into Leonida',
    hours: 'Roadmap step 1 of 3 · the whole campaign runs about 60–80 hours',
    body: 'Play the opening chapter for the story’s sake and let the side systems introduce themselves. Gone Fishing opens the game; Kenton’s treasure dives and Cal’s fishing arrive on their own; the TV at home already runs three of the four arcade games. Build two habits now that pay off hundreds of hours later: scan every new vehicle shape with the WAiNK app, and study animals through the binoculars whenever they cross your path.',
    watch: 'One thing cannot wait: on a Chapter 1 morning after the mission Down to Earth, Lucia steps onto the balcony at Jason’s house to meditate. Follow her and accept. That meditation disappears when the chapter ends and may be required for Positive Mental Attitude — the only potentially missable trophy on the list.',
  },
  {
    stage: 2,
    title: 'Chapters 2–3 — two lives, one map',
    hours: 'Still roadmap step 1 · story and side content side by side',
    body: 'Coffee Break in Chapter 2 opens free-roaming as a pair, and with it the partner trophies, shared workouts and most character questlines: Billy at the mud club and Bret’s hunts first, then in Chapter 3 Andy (Lucia only), Randy’s wish list and Tyrone’s labs (Jason only). Yasmani’s Chapter 3 jobs hand you the Snap Gun and, with Credit Check, the Dye Pack Jammer, so quiet jewelry work and marked-bill laundering both start here. Buy garages and register cars as the money lands, not in a lump at the end.',
    watch: null,
  },
  {
    stage: 3,
    title: 'Chapters 4–5 — finish the story',
    hours: 'End of roadmap step 1 · the finale and its gold',
    body: 'The last two chapters carry the remaining named missions — Child’s Play, Headliners, VCIA Takedown, Operation Savage Glory — and the final mission itself. A Chapter 4 optional mission, That’s Where The Money Is…, introduces bank vault robberies: the game’s best income, and two trophies (Maximum Withdrawal, A Classic Blitz Play) from a single system. Keep a manual save at every chapter break; with no mission replay, those saves are your only insurance.',
    watch: null,
  },
  {
    stage: 4,
    title: 'The 100% checklist — the long gold',
    hours: 'Roadmap step 2 of 3 · about 100 hours',
    body: 'After the credits, the checklist appears under Progress, Stats, 100% Completion, with everything from the campaign already counted. It asks for roughly 60% of the game rather than all of it: 200 of 277 vehicle scans, 100 of 255 animals studied, 70 of the 80 challenges, 300 stunts — but the robberies, all 42 shooting-range golds and all 42 drone races in full. Work it category by category, fold in the card sets, the WAiNK scans and the stranger strands, and A Long Road falls at the end of it.',
    watch: null,
  },
  {
    stage: 5,
    title: 'Cleanup — secrets, grinds and the platinum',
    hours: 'Roadmap step 3 of 3 · about 10 hours, plus whatever the checklist left behind',
    body: 'What remains is a drawer of one-offs: a jet lifted from a VCIA boarding gate, a tank borrowed from Mile Zero Air Station, three valuables inside a bowling alley, 500 Criminal Profile actions, $100,000 spent in shops. Five secret trophies still have no confirmed trigger; their guides in this app say exactly that instead of inventing steps. When the last trophy pops, Vice Got a Price! follows on its own.',
    watch: null,
  },
];

export const ROADMAP_FACTS = [
  { label: 'Difficulty', value: '4 / 10 (PowerPyx)' },
  { label: 'Time to platinum', value: 'about 200 hours' },
  { label: 'Playthroughs', value: '1 — no New Game+, no mission replay' },
  { label: 'Online trophies', value: 'none — the whole list is single-player' },
  { label: 'Cheats', value: 'disable trophies and saving — keep them out of a trophy run' },
  { label: 'Manual saves', value: '15 slots — park one at the start and end of every chapter' },
];

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Renders the roadmap into `container`. nameFor(trophy) supplies the name to
// show (the caller applies the spoiler shield); onPick(trophy) fires when a
// trophy chip is clicked, so the reader lands on its guide.
export function renderRoadmap(container, { trophies, tracker, sources, nameFor, onPick }) {
  container.replaceChildren();

  const intro = h('p', 'roadmap-intro');
  intro.append(
    'One playthrough, five movements. The order below follows the game’s own gates — what each chapter unlocks, when the pair can roam together, and when the 100% checklist opens — so nothing is attempted before the game allows it, and the one missable moment is flagged where it happens, in ',
  );
  const strong = h('strong', null, 'Phase 1');
  intro.append(strong, '.');
  container.append(intro);

  const facts = h('div', 'roadmap-facts');
  for (const fact of ROADMAP_FACTS) {
    const box = h('div', 'fact');
    const b = h('b', null, `${fact.label}: `);
    box.append(b, fact.value);
    facts.append(box);
  }
  container.append(facts);

  for (const phase of ROADMAP_PHASES) {
    const section = h('section', 'phase');
    const heading = h('h3');
    heading.append(h('span', 'phase-num', `Phase ${phase.stage}`), phase.title);
    section.append(heading);
    section.append(h('p', 'phase-hours', phase.hours));
    section.append(h('p', null, phase.body));
    if (phase.watch) {
      const watch = h('p', 'phase-watch');
      const label = h('strong', null, 'Watch out: ');
      watch.append(label, phase.watch);
      section.append(watch);
    }
    const members = trophies.filter((t) => t.stage === phase.stage);
    const done = members.filter((t) => tracker.isEarned(t.id)).length;
    section.append(h('p', 'phase-hours', `${done} of ${members.length} earned in this phase`));
    const chips = h('div', 'phase-trophies');
    for (const t of members) {
      const earned = tracker.isEarned(t.id);
      const chip = h('button', `phase-trophy${earned ? ' done' : ''}`);
      chip.type = 'button';
      chip.append(h('span', 'mark', earned ? '✓' : '○'), nameFor(t));
      chip.addEventListener('click', () => onPick(t));
      chips.append(chip);
    }
    section.append(chips);
    container.append(section);
  }

  const footer = h('p', 'roadmap-sources');
  footer.append('Roadmap facts — difficulty, hours, checklist thresholds, what unlocks when — follow the sources cited beside each trophy’s guide, chiefly: ');
  sources.forEach((s, i) => {
    if (i > 0) footer.append(' · ');
    const a = h('a', null, s.name);
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    footer.append(a);
  });
  footer.append('.');
  container.append(footer);
}
