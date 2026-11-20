// Leonida Ledger — the tracker store.
//
// Earned trophies live in the browser's localStorage as a JSON array of
// trophy ids, so progress survives reloads with no account and no network.
// The store also exports the set to a JSON file and imports it back, which
// is how a reader moves their checklist between machines.

const STORAGE_KEY = 'leonida-ledger.earned.v1';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function writeStored(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
  } catch {
    // Private modes may refuse storage; the in-memory set still works.
  }
}

// A small observable store: the UI subscribes once and re-renders on change.
export class Tracker {
  constructor() {
    this.earned = readStored();
    this.listeners = new Set();
    this.persist = true;
  }

  // Screenshot demo states replace the earned set with a fixed one; that
  // must never be written over the reader's real stored progress.
  suspendPersistence() {
    this.persist = false;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  changed() {
    if (this.persist) writeStored(this.earned);
    for (const fn of this.listeners) fn(this.earned);
  }

  has(id) {
    return this.earned.has(id);
  }

  toggle(id) {
    if (this.earned.has(id)) this.earned.delete(id);
    else this.earned.add(id);
    this.changed();
  }

  replace(ids) {
    this.earned = new Set(ids);
    this.changed();
  }

  clear() {
    this.replace([]);
  }

  // Summary numbers for the header: how many earned, of how many, and the
  // PlayStation points they are worth (bronze 15, silver 30, gold 90,
  // platinum 300 — 1,350 across the whole list).
  summary(trophies) {
    let count = 0;
    let points = 0;
    let totalPoints = 0;
    for (const trophy of trophies) {
      totalPoints += trophy.points;
      if (this.earned.has(trophy.id)) {
        count += 1;
        points += trophy.points;
      }
    }
    return {
      count,
      total: trophies.length,
      points,
      totalPoints,
      percent: trophies.length ? Math.round((count / trophies.length) * 100) : 0,
    };
  }

  // Downloads the earned set as a small JSON file the reader can keep.
  exportToFile() {
    const payload = {
      app: 'leonida-ledger',
      version: 1,
      earned: [...this.earned].sort(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leonida-ledger-progress.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Reads a file produced by exportToFile (or any JSON holding an "earned"
  // array of ids) and adopts the ids that name real trophies.
  async importFromFile(file, validIds) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const list = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(list)) throw new Error('no "earned" list in that file');
    const accepted = list.filter((id) => typeof id === 'string' && validIds.has(id));
    this.replace(accepted);
    return accepted.length;
  }
}
