// Leonida Ledger — the platinum roadmap.
//
// Five phases, in the order a first playthrough should meet them. The
// headline numbers are the ones the cited guides agree on: PowerPyx rates
// the platinum 4/10 at roughly 200 hours with a single playthrough, and
// GTA Zone's list tells the same story. Facts that decide the route — the
// one missable trophy, cheats disabling trophies, the chapter-save habit —
// are called out where they bite, not buried in a footnote.

export const ROADMAP_FACTS = [
  { label: 'Difficulty', value: '4 / 10' },
  { label: 'Time to platinum', value: '~200 hours' },
  { label: 'Playthroughs', value: '1' },
  { label: 'Online trophies', value: '0 of 55' },
  { label: 'Missable', value: '1 (maybe)' },
  { label: 'Hardest trophy', value: 'A Long Road' },
];

export const ROADMAP_INTRO =
  'One playthrough is enough, and almost nothing can be locked away from ' +
  'you: after the credits the game returns you to free-roam with every ' +
  'trophy still reachable. The two disciplines that matter are saves and ' +
  'cheats. There is no mission replay, so keep a manual save at the start ' +
  'of every chapter — the game gives you 15 manual slots, and a chapter ' +
  'save is the only way back to the one missable moment. And leave cheats ' +
  'alone entirely: turning one on disables trophies and saving for the ' +
  'session, and cheats only unlock after the story anyway.';

export const PHASES = [
  {
    n: 1,
    title: 'Chapter 1 — catch the one missable moment',
    hours: 'opening hours',
    text:
      'Start a manual save before anything else. Play the opening chapter ' +
      'and, after the Down to Earth mission, watch Lucia at Jason\u2019s ' +
      'house: one morning she says she is going to meditate and walks out ' +
      'to the balcony. Follow her, accept, and meditate with her. That ' +
      'spot vanishes for good when Chapter 1 ends and it may be required ' +
      'for Positive Mental Attitude — the only missable trophy in the ' +
      'game. Everything else in the chapter is safe to enjoy blind.',
    trophies: ['just-like-paradise', 'paradise-lost', 'positive-mental-attitude'],
  },
  {
    n: 2,
    title: 'Chapters 2–5 — finish the story, scan as you go',
    hours: '60–80 hours',
    text:
      'Play the remaining chapters and take optional missions as they ' +
      'appear. Two habits pay off later: scan every new vehicle with the ' +
      'WAiNK app and study new animals through the binoculars whenever ' +
      'you pass them. The 100% checklist is not viewable yet, but all of ' +
      'that progress already counts toward it. There are no mission gold ' +
      'medals to protect and no difficulty setting to pick — the story ' +
      'trophies, including the final-mission gold, are all automatic.',
    trophies: [
      't-s-ass-drug-money', 'vice-city-baby', 'top-of-the-world-ma',
      'you-gotta-know-when-to-get-off', 'trust', 'break-the-bank',
      'family-matters', 'dwnfall', 'hi-jacked', 'snow-storm',
    ],
  },
  {
    n: 3,
    title: 'After the credits — work the 100% checklist',
    hours: '~100 hours',
    text:
      'The checklist unlocks under Progress > Stats > 100% Completion, ' +
      'and it is lenient — closer to 60% of true completion. Most ' +
      'collectible types and side quests are not required; you need any ' +
      '200 of 277 vehicles, 100 of 255 animals, 50 of 66 weapons and any ' +
      '70 of the 80 challenges, so skip the challenges you hate. Only ' +
      'five tasks demand everything: Robberies, Underwater Discoveries, ' +
      'Shooting Ranges, Drone Races and Bret\u2019s Quests. A Long Road, ' +
      'the hardest trophy in the set, pops when the checklist closes.',
    trophies: [
      'a-long-road', 'cunning-stunts', 'the-shootist', 'top-fun',
      'one-last-thing', 'master-of-none',
    ],
  },
  {
    n: 4,
    title: 'The people of Leonida — strangers and cleanup',
    hours: '~10 hours',
    text:
      'What the checklist ignores, finish now: the 8 stranger strands for ' +
      'Strangers & Freaks (only certain questlines count — Kirk, Kyle, ' +
      'Yago and Pilot Pete among them) and the character lines for Andy, ' +
      'Kenton, Billy, Randy, Tyrone and Bret, which all survive into ' +
      'free-roam. Sweep the remaining collectibles in the same pass: the ' +
      'card sets, the WAiNK scans and the rest of the 18 meditation ' +
      'spots, meditating as both characters wherever a spot allows it.',
    trophies: [
      'strangers-freaks', 'road-to-rehabilitation', 'this-was-no-boat-accident',
      'the-lone-rider', 'supply-demand', 'spin-on-this', 'fair-game',
      'don-t-touch-my-deck', 'you-wainker', 'whip-it-good', 'the-goodtime-state',
    ],
  },
  {
    n: 5,
    title: 'The last percent — money, metal and the platinum',
    hours: 'the final stretch',
    text:
      'Close out the economy trophies, which mostly feed each other: the ' +
      '8 bank-vault jobs pay up to $205,000 each and cover Maximum ' +
      'Withdrawal and A Classic Blitz Play on the way; launder $250,000 ' +
      'of marked bills through Yasmani for Dime on the Dollar; spend ' +
      '$100,000 for Treat Yo Self; buy the 8 garages ($160,000) for ' +
      'Little Boxes, then use their parking spots to register 10 cheap ' +
      'vehicles for On the Spot. Whatever challenges remain, pick the 50 ' +
      'easiest. When the 54th trophy lands, Vice Got a Price! follows on ' +
      'its own.',
    trophies: [
      'maximum-withdrawal', 'a-classic-blitz-play', 'dime-on-the-dollar',
      'treat-yo-self', 'little-boxes', 'on-the-spot', 'vice-got-a-price',
    ],
  },
];

export const FREE_ROAM_INTRO =
  'The phases above carry the story and the long grinds, but they are ' +
  'not the whole list. These eighteen ask for no particular order and ' +
  'none of them can be missed: the races and one-off feats (Earn Cash, ' +
  'Not Kudos, Gunslinger, Hot Together, Retail Therapy), the introductions ' +
  'that pop as you unfog the map (Baited My Tackle, Stick Fiddler), the ' +
  'heists and capers that unlock as the story opens the world ' +
  '(Sneakthief, Let\u2019s Go Bowling, Catch Me If You Can, Challenging ' +
  'Tank, Pest Control), the slow-burn stats (Personal Best, Actions ' +
  'Speak Louder) — and the five secret trophies whose triggers no named ' +
  'guide has confirmed yet (In the Beginning\u2026, Capital Offense, Bad ' +
  'Luck, I Guess, The Truth Is Out There, Ten Pin). Sweep them up ' +
  'whenever free-roam takes you past them.';

export const ROADMAP_SOURCES = [
  {
    name: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
  },
  {
    name: 'GTA Zone — GTA 6 Trophy List: All 55 Trophies and Achievements',
    url: 'https://gta-zone.com/news/gta-6-trophies-achievements/',
  },
];
