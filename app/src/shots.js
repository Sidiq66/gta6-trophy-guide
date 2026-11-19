// Shot modes: fixed, reproducible states for the screenshots, selected with
// the ?shot= query parameter, mirroring the pattern the starter used.
//   ?shot=list                    the guide, everything loaded
//   ?shot=detail&trophy=<id>      the guide with one trophy's detail open
//   ?shot=roadmap                 the platinum roadmap
//   ?shot=tracker                 the guide with a believable mid-run tracker
// When a shot state is painted, window.__shotReady flips true so the
// screenshot tool knows the frame is final.

// Ten early trophies a player a few evenings in would plausibly hold:
// the Chapter 1 set, two Chapter 2 story trophies, and two early activities.
export const SHOT_EARNED = [
  'just-like-paradise',
  'paradise-lost',
  'ts-ass-drug-money',
  'trust',
  'baited-my-tackle',
  'stick-fiddler',
  'this-was-no-boat-accident',
  'road-to-rehabilitation',
  'hot-together',
  'master-of-none',
];

export function planShot(search) {
  const params = new URLSearchParams(search);
  const shot = params.get('shot');
  if (!shot) return null;
  if (shot === 'roadmap') return { view: 'roadmap' };
  if (shot === 'tracker') return { view: 'guide', seedEarned: SHOT_EARNED, selectedId: 'the-shootist' };
  if (shot === 'detail') return { view: 'guide', selectedId: params.get('trophy') ?? undefined };
  return { view: 'guide' };
}

export function markShotReady() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
