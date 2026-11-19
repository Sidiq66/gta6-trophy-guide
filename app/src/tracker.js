// The tracker: which trophies are earned, kept in localStorage so progress
// survives closing the browser, plus the spoiler-shield setting, plus
// export/import of the earned set as a small JSON file the player owns.

import { GRADE_INFO } from './data.js';

const EARNED_KEY = 'leonida-ledger-earned-v1';
const SETTINGS_KEY = 'leonida-ledger-settings-v1';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function createTracker(trophies) {
  const validIds = new Set(trophies.map((t) => t.id));
  const saved = readJson(EARNED_KEY, []);
  let earned = new Set((Array.isArray(saved) ? saved : []).filter((id) => validIds.has(id)));
  const settings = readJson(SETTINGS_KEY, {});
  let spoilers = settings.spoilers === true;

  function persistEarned() {
    localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
  }

  function persistSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ spoilers }));
  }

  return {
    isEarned(id) {
      return earned.has(id);
    },
    setEarned(id, on) {
      if (!validIds.has(id)) return;
      if (on) earned.add(id);
      else earned.delete(id);
      persistEarned();
    },
    earnedIds() {
      return [...earned];
    },
    spoilersOn() {
      return spoilers;
    },
    setSpoilers(on) {
      spoilers = on === true;
      persistSettings();
    },
    // Replace the earned set wholesale (shot mode and imports use this).
    seed(ids) {
      earned = new Set(ids.filter((id) => validIds.has(id)));
      persistEarned();
    },
    summary() {
      let points = 0;
      for (const t of trophies) {
        if (earned.has(t.id)) points += GRADE_INFO[t.grade]?.points ?? 0;
      }
      return { count: earned.size, total: trophies.length, points };
    },
    exportText() {
      return JSON.stringify(
        { app: 'leonida-ledger', kind: 'gta6-trophy-progress', version: 1, earned: [...earned].sort() },
        null,
        2,
      );
    },
    // Accepts this app's export format, or a bare array of trophy ids.
    // Returns how many trophies the file marked earned.
    importText(text) {
      const parsed = JSON.parse(text);
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('no earned list in that file');
      earned = new Set(ids.filter((id) => validIds.has(id)));
      persistEarned();
      return earned.size;
    },
  };
}

export function downloadProgress(tracker) {
  const blob = new Blob([tracker.exportText()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-ledger-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
