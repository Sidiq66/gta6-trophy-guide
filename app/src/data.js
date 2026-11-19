// Data access for the guide: loads app/data/trophies.json (a file of this app,
// fetched relative to the page, so it works from any static server, offline)
// and holds the small vocabularies the UI shares — grade labels and point
// values, and the kind labels used by the filters.

export const GRADE_INFO = {
  platinum: { label: 'Platinum', points: 300 },
  gold: { label: 'Gold', points: 90 },
  silver: { label: 'Silver', points: 30 },
  bronze: { label: 'Bronze', points: 15 },
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const KIND_INFO = {
  story: { label: 'Story' },
  missable: { label: 'Missable' },
  collectibles: { label: 'Collectibles' },
  activities: { label: 'Activities' },
  online: { label: 'Online' },
  platinum: { label: 'Platinum' },
};

// The order the filter chips are shown in.
export const KIND_ORDER = ['story', 'missable', 'collectibles', 'activities', 'online', 'platinum'];

export async function loadGuide() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json answered ${response.status}`);
  const doc = await response.json();
  const trophies = Array.isArray(doc) ? doc : doc.trophies;
  return { doc, trophies };
}

export function trophyById(trophies, id) {
  return trophies.find((t) => t.id === id) ?? null;
}

export function totalPoints(trophies) {
  return trophies.reduce((sum, t) => sum + (GRADE_INFO[t.grade]?.points ?? 0), 0);
}

// Every distinct source cited anywhere in the data, in first-use order —
// the roadmap footer and the about text draw from this, so a source is
// written once, in the data file, and never repeated in code.
export function collectSources(trophies) {
  const seen = new Map();
  for (const t of trophies) {
    for (const s of t.sources ?? []) {
      if (!seen.has(s.url)) seen.set(s.url, s);
    }
  }
  return [...seen.values()];
}
