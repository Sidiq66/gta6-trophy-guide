// Leonida Ledger — data access.
//
// The whole guide hangs off one file: data/trophies.json, fetched relative
// to the page so the app works from any static server with app/ at its
// root. Nothing else is ever requested: no fonts, no images, no APIs.

export const GRADE_POINTS = { bronze: 15, silver: 30, gold: 90, platinum: 300 };

export const GRADE_LABEL = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

// Filter chips, in the order the guide presents them. "online" is part of
// the vocabulary even though GTA VI ships with no online trophies.
export const KINDS = [
  { id: 'all', label: 'All 55' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'activities', label: 'Activities' },
  { id: 'online', label: 'Online' },
  { id: 'platinum', label: 'Platinum' },
];

export const KIND_LABEL = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  platinum: 'Platinum',
};

let cache = null;

// Loads the trophy list once and keeps it for the session. Returns the
// parsed document: { game, platform, list, trophies: [...] } where each
// trophy carries id, name, description, grade, points, kind, secret,
// missable, guide and sources.
export async function loadGuideData() {
  if (cache) return cache;
  const response = await fetch('data/trophies.json');
  if (!response.ok) {
    throw new Error(`trophies.json answered ${response.status}`);
  }
  cache = await response.json();
  return cache;
}

// Display name for a trophy under the spoiler shield: secret trophies the
// reader has not earned yet are masked, everything else shows its name.
export function shownName(trophy, earned, shieldOn) {
  if (shieldOn && trophy.secret && !earned.has(trophy.id)) return 'Hidden trophy';
  return trophy.name;
}

export function shownDescription(trophy, earned, shieldOn) {
  if (shieldOn && trophy.secret && !earned.has(trophy.id)) {
    return 'This trophy is secret on PlayStation. Its name and description stay ' +
      'hidden until you earn it — or switch the spoiler shield off.';
  }
  return trophy.description;
}
